import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { OutboxModule } from '../outbox/outbox.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [OutboxModule, PrismaModule],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
