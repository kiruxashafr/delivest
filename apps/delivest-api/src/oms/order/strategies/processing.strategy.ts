import { Injectable, Logger } from '@nestjs/common';
import { IOrderStatusStrategy } from '../interfaces/order-status.strategy.interface.js';
import { Order, OrderStatus } from '../../../../generated/prisma/client.js';
import { IdentityService } from '../../../identify/identify.service.js';

@Injectable()
export class ProcessingStrategy implements IOrderStatusStrategy {
  private readonly logger = new Logger(ProcessingStrategy.name);

  readonly status = OrderStatus.PROCESSING;

  constructor(private readonly identifyService: IdentityService) {}

  async execute(order: Order): Promise<void> {
    this.logger.log(
      `[OrderService] Processing strategy triggered for Order ID: ${order.id}`,
    );
    if (order.phone) {
      await this.identifyService.createProfileIfNotExist({
        phone: order.phone,
      });
    }
  }
}
