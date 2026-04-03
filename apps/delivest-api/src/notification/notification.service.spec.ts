import { jest } from '@jest/globals';

jest.unstable_mockModule('@nestjs-cls/transactional', () => {
  return {
    Transactional:
      () => (target: any, key: string, descriptor: PropertyDescriptor) => {
        return descriptor;
      },
    TransactionHost: class {
      get tx() {
        return {};
      }
    },
  };
});

const { TransactionHost } = await import('@nestjs-cls/transactional');
const { Test } = await import('@nestjs/testing');
const { Logger } = await import('@nestjs/common');
const { NotificationService } = await import('./notification.service.js');
const { OutboxService } = await import('../outbox/outbox.service.js');
const { PrismaService } = await import('../prisma/prisma.service.js');
const { AuthStatus, SendCodeType } =
  await import('../../generated/prisma/enums.js');
const {
  ForbiddenException,
  ResendLimitExceededException,
  ResendTooFastException,
} = await import('../shared/exception/domain_exception/domain-exception.js');

describe('NotificationService', () => {
  let service: any;
  let outboxService: any;
  let prisma: any;
  let txHost: any;

  const mockTarget = '+79161234567';
  const mockAuthMessage = {
    id: 'msg-123',
    target: mockTarget,
    code: '1111',
    resendCount: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 300000),
    status: AuthStatus.PENDING,
    attemptsCount: 0,
  };

  beforeEach(async () => {
    const mockTx = {
      authMessage: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: TransactionHost,
          useValue: {
            tx: mockTx,
            withTransaction: jest.fn(async (cb: any) => await cb()),
          },
        },
        {
          provide: OutboxService,
          useValue: {
            save: jest.fn().mockImplementation(() => Promise.resolve()),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            authMessage: {
              update: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(NotificationService);
    outboxService = module.get(OutboxService);
    prisma = module.get(PrismaService);
    txHost = module.get(TransactionHost);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendAuthCode', () => {
    it('should throw ResendLimitExceededException if maxResendCount reached', async () => {
      const exhaustedCode = {
        ...mockAuthMessage,
        resendCount: 3,
        createdAt: new Date(Date.now() - 120000),
      };
      txHost.tx.authMessage.findFirst.mockResolvedValue(exhaustedCode);

      await expect(
        service.sendAuthCode(mockTarget, SendCodeType.UCALLER),
      ).rejects.toThrow(ResendLimitExceededException);
    });
    it('should create a new code and save to outbox if no pending code exists', async () => {
      txHost.tx.authMessage.findFirst.mockResolvedValue(null);
      txHost.tx.authMessage.create.mockResolvedValue(mockAuthMessage);

      const result = await service.sendAuthCode(
        mockTarget,
        SendCodeType.UCALLER,
      );

      expect(txHost.tx.authMessage.create).toHaveBeenCalled();
      expect(outboxService.save).toHaveBeenCalled();
      expect(result).toEqual(mockAuthMessage);
    });

    it('should handle existing code (resend) if limits are not exceeded', async () => {
      const oldCode = {
        ...mockAuthMessage,
        createdAt: new Date(Date.now() - 120000),
        resendCount: 1,
      };

      txHost.tx.authMessage.findFirst.mockResolvedValue(oldCode);
      txHost.tx.authMessage.update.mockResolvedValue({
        ...oldCode,
        resendCount: 2,
      });

      await service.sendAuthCode(mockTarget, SendCodeType.UCALLER);

      expect(txHost.tx.authMessage.update).toHaveBeenCalledWith({
        where: { id: oldCode.id },
        data: expect.objectContaining({
          resendCount: { increment: 1 },
        }),
      });
    });

    it('should throw ResendTooFastException if called again within 60 seconds', async () => {
      const freshCode = {
        ...mockAuthMessage,
        createdAt: new Date(),
      };
      txHost.tx.authMessage.findFirst.mockResolvedValue(freshCode);

      await expect(
        service.sendAuthCode(mockTarget, SendCodeType.UCALLER),
      ).rejects.toThrow(ResendTooFastException);
    });
  });

  describe('checkAuthCode', () => {
    it('should verify successfully and update status to VERIFIED', async () => {
      txHost.tx.authMessage.findFirst.mockResolvedValue(mockAuthMessage);

      await service.checkAuthCode(mockTarget, '1111');

      expect(prisma.authMessage.update).toHaveBeenCalledWith({
        where: { id: mockAuthMessage.id },
        data: { status: 'VERIFIED' },
      });
    });

    it('should increment attemptsCount and throw ForbiddenException on wrong code', async () => {
      txHost.tx.authMessage.findFirst.mockResolvedValue(mockAuthMessage);

      await expect(service.checkAuthCode(mockTarget, '0000')).rejects.toThrow(
        ForbiddenException,
      );

      expect(prisma.authMessage.update).toHaveBeenCalledWith({
        where: { id: mockAuthMessage.id },
        data: {
          attemptsCount: 1,
          status: 'PENDING',
        },
      });
    });
  });

  describe('Private Methods Logic', () => {
    it('generateFourDigitCode should return 4 digits', () => {
      const code = service.generateFourDigitCode();
      expect(code).toHaveLength(4);
      expect(/^\d{4}$/.test(code)).toBe(true);
    });

    it('getExpiryDate should return date in future (5 min)', () => {
      const now = new Date('2026-01-01T12:00:00Z').getTime();
      jest.useFakeTimers().setSystemTime(now);

      const expiry = service.getExpiryDate();
      expect(expiry.getTime()).toBe(now + 5 * 60 * 1000);

      jest.useRealTimers();
    });
  });
});
