import { Injectable, Logger } from '@nestjs/common';
import { OutboxService } from '../outbox/outbox.service.js';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { SendAuthCodeEvent } from './events/send-aunt-code.event.js';
import { DelivestEvent } from '../shared/events/types.js';
import { toPrismaJson } from '../utils/to-prisma-json.js';
import { AuthStatus, SendCodeType } from '../../generated/prisma/enums.js';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { AuthMessage, PrismaClient } from '../../generated/prisma/client.js';
import {
  DomainException,
  ForbiddenException,
  InternalErrorException,
  ResendLimitExceededException,
  ResendTooFastException,
} from '../shared/exception/domain_exception/domain-exception.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private readonly config = {
    maxResendCount: 3,
    minResendIntervalMs: 60000,
    codeLifetimeMinutes: 5,
    maxVerificationAttempts: 3,
  };

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
    private readonly outboxService: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  @Transactional()
  async sendAuthCode(target: string, type: SendCodeType) {
    try {
      this.logger.log(`sendAuthCode() | Start for ${target}`);

      const pendingCode = await this.findPendingCode(target);

      if (pendingCode) {
        return await this.handleExistingCode(pendingCode);
      } else {
        return await this.handleNewCode(target, type);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkAuthCode(target: string, code: string) {
    try {
      const codeMessage = await this.findPendingCode(target);
      if (!codeMessage) {
        this.logger.warn(
          `checkAuthCode() | No PENDING code found for ${target}`,
        );
        throw new ForbiddenException('Code not found or already used');
      }

      if (code === codeMessage?.code) {
        await this.prisma.authMessage.update({
          where: { id: codeMessage.id },
          data: { status: 'VERIFIED' },
        });
        return;
      }
      const currentAttempts = codeMessage.attemptsCount + 1;
      const isFailed = currentAttempts >= this.config.maxVerificationAttempts;

      await this.prisma.authMessage.update({
        where: { id: codeMessage.id },
        data: {
          attemptsCount: currentAttempts,
          status: isFailed ? 'FAILED' : 'PENDING',
        },
      });

      if (isFailed) {
        this.logger.warn(
          `checkAuthCode() | Max attempts reached for ${target}`,
        );
      }

      throw new ForbiddenException('Invalid verification code');
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }

      this.logger.error(
        `checkAuthCode() | Unexpected error: ${(error as Error).message}`,
        (error as Error).stack,
      );

      throw new InternalErrorException(
        'Ошибка при проверке кода подтверждения',
      );
    }
  }

  private async handleExistingCode(code: AuthMessage) {
    this.validateResendLimits(code);

    const updatedCode = await this.txHost.tx.authMessage.update({
      where: { id: code.id },
      data: {
        resendCount: { increment: 1 },
        updatedAt: new Date(),
        expiresAt: this.getExpiryDate(),
      },
    });

    await this.publishAuthEvent(updatedCode.id);

    this.logger.log(
      `sendAuthCode() | Resent: ${updatedCode.id}, count: ${updatedCode.resendCount}`,
    );
    return updatedCode;
  }

  private async handleNewCode(target: string, type: SendCodeType) {
    const code = this.generateFourDigitCode();

    const newRecord = await this.txHost.tx.authMessage.create({
      data: {
        target,
        type,
        code,
        expiresAt: this.getExpiryDate(),
        status: AuthStatus.PENDING,
      },
    });

    await this.publishAuthEvent(newRecord.id);

    this.logger.log(
      `sendAuthCode() | Created: ${newRecord.id}, expires: ${newRecord.expiresAt?.toISOString()}`,
    );
    return newRecord;
  }

  private validateResendLimits(code: AuthMessage) {
    if (code.resendCount >= this.config.maxResendCount) {
      throw new ResendLimitExceededException(
        'Превышен лимит запросов на отправку кода подтверждения',
      );
    }

    const timeSinceLastSend = Date.now() - code.createdAt.getTime();
    if (timeSinceLastSend < this.config.minResendIntervalMs) {
      const waitSeconds = Math.ceil(
        (this.config.minResendIntervalMs - timeSinceLastSend) / 1000,
      );
      throw new ResendTooFastException(
        `Подождите ${waitSeconds} сек. перед повторной отправкой`,
      );
    }
  }

  private async publishAuthEvent(authCodeId: string) {
    const event = new SendAuthCodeEvent(authCodeId);
    await this.outboxService.save(
      DelivestEvent.AUTH_CODE_REQUESTED,
      toPrismaJson(event),
    );
  }

  private getExpiryDate(): Date {
    return new Date(Date.now() + this.config.codeLifetimeMinutes * 60 * 1000);
  }

  private handleError(error: unknown): never {
    this.logger.error(`sendAuthCode() failed: ${(error as Error).message}`);

    if (error instanceof DomainException) {
      throw error;
    }

    throw new InternalErrorException('Не удалось отправить код подтверждения');
  }

  private async findPendingCode(target: string) {
    return await this.txHost.tx.authMessage.findFirst({
      where: {
        target,
        status: AuthStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateFourDigitCode(): string {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
  }
}
