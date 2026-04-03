import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DelivestEvent } from '../../shared/events/types.js';
import { SendAuthCodeEvent } from '../events/send-aunt-code.event.js';
import type { IAuthCodeSenderUCaller } from '@delivest/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SendCodeListener {
  private readonly logger = new Logger(SendCodeListener.name);
  constructor(
    private readonly prisma: PrismaService,

    @Inject('IAuthCodeSenderUCaller')
    private readonly authCodeSenderUCaller: IAuthCodeSenderUCaller,
  ) {}

  @OnEvent(DelivestEvent.AUTH_CODE_REQUESTED)
  async handleSendAuthCode(payload: SendAuthCodeEvent) {
    try {
      const message = await this.prisma.authMessage.findUnique({
        where: { id: payload.authCodeId },
      });

      if (!message) {
        this.logger.warn(
          `handleSendAuthCode() | No auth message found for ID ${payload.authCodeId}`,
        );
        return;
      }

      switch (message.type) {
        case 'UCALLER':
          await this.SendAuthCodeUCaller(payload);
          break;
        default:
          this.logger.warn(
            `handleSendAuthCode() | Unsupported message type: ${message.type as string}`,
          );
      }
    } catch (err) {
      this.logger.error(`handleSendAuthCode() | ${(err as Error).message}`);
      return err as Error;
    }
  }

  async SendAuthCodeUCaller(payload: SendAuthCodeEvent) {
    await this.authCodeSenderUCaller.send(payload.authCodeId);
  }
}
