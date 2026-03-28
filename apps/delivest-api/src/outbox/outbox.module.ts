import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service.js';
import { OutboxProcessor } from './outbox.processor.js';

@Module({
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
