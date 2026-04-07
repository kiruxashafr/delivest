import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(private readonly prisma: PrismaService) {}

  async addItem(sessionId: string, productId: string, quantity: number) {
    try {
      const cart = await this.prisma.cart.upsert({
        where: { sessionId },
        update: {},
        create: { sessionId },
      });
      return await this.prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to add item ${productId} to cart for session ${sessionId}`,
        error,
      );
      throw error;
    }
  }
  async findItem(cartId: string, productId: string) {
    try {
      const item = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
      });
      return item;
    } catch (error) {
      this.logger.error(
        `Failed to find item ${productId} in cart ${cartId}`,
        error,
      );
      throw error;
    }
  }
  async findCartBySessionId(sessionId: string) {
    try {
      const cart = await this.prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: true,
        },
      });
      return cart;
    } catch (error) {
      this.logger.error(`Failed to find cart for session ${sessionId}`, error);
      throw error;
    }
  }
}
