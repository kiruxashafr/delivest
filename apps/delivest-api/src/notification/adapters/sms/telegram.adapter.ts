import { IAuthCodeSender } from '@delivest/common';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramSmsAdapter implements IAuthCodeSender {
  private readonly logger = new Logger(TelegramSmsAdapter.name);
  private readonly adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
  constructor(
    private readonly prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async send(authCodeId: string): Promise<void> {
    try {
      this.logger.debug(`start sending message to tg`);
      const authRecord = await this.prisma.authMessage.findUnique({
        where: { id: authCodeId },
      });

      if (!authRecord) {
        this.logger.warn(`[Telegram] Record with ID ${authCodeId} not found`);
        return;
      }

      const messageText =
        `🔑 *Новый код подтверждения*\n\n` +
        `👤 **ID:** \`${authRecord.id}\`\n` +
        `📞 **Номер:** \`${authRecord.target}\`\n` +
        `🔢 **Код:** \`${authRecord.code}\``;

      await this.bot.telegram.sendMessage(
        Number(this.adminChatId),
        messageText,
        {
          parse_mode: 'Markdown',
        },
      );

      this.logger.log(
        `[DEV-TG] Code ${authRecord.code} sent to Telegram admin chat`,
      );
    } catch (err) {
      this.logger.error(
        `[Telegram] Failed to send message: ${(err as Error).message}`,
      );
      throw err;
    }
  }
}
