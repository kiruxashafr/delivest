import { IEventBus } from '@delivest/common';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NestEventBusAdapter implements IEventBus {
  private readonly logger = new Logger(NestEventBusAdapter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish<T>(eventName: string, payload: T): Promise<void> {
    this.logger.debug(`[EventBus] Publishing: ${eventName}`);
    await this.eventEmitter.emitAsync(eventName, payload);
  }
}
