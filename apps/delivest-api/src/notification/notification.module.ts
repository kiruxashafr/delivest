import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { OutboxModule } from '../outbox/outbox.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SendCodeListener } from './listeners/send-code.listener.js';

@Module({
  imports: [OutboxModule, PrismaModule],
  controllers: [],
  providers: [NotificationService, SendCodeListener],
  exports: [NotificationService],
})
export class NotificationModule {}
