import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CartResponse } from '@delivest/types';
import { Cart, CartItem } from '../../../generated/prisma/client.js';
import { NetService } from '../../net/net.service.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadCartDto } from './dto/read-cart.dto.js';

export type InternalCartWithItems = Cart & {
  items: CartItem[];
};

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly netService: NetService,
  ) {}

  async addItem(sessionId: string, productId: string, quantity: number) {
    try {
      const cart = await this.prisma.cart.upsert({
        where: { sessionId },
        update: {},
        create: { sessionId },
      });
      await this.prisma.cartItem.upsert({
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

      const updatedCart = await this.prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: true },
      });

      if (!updatedCart) {
        throw new Error(`Cart not found after update for session ${sessionId}`);
      }

      return this.mapCartToResponse(updatedCart as InternalCartWithItems);
    } catch (error) {
      this.logger.error(
        `Failed to add item ${productId} to cart for session ${sessionId}`,
        error,
      );
      throw error;
    }
  }

  async mapCartToResponse(cart: InternalCartWithItems): Promise<ReadCartDto> {
    const productIds = cart.items.map((item) => item.productId);
    const productPromises = productIds.map((id) =>
      this.netService.getProductById(id),
    );
    const products = await Promise.all(productPromises);
    const items = cart.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const price = product?.price ?? 0;
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: product?.name ?? 'Unknown',
        price: price,
        totalPrice: price * item.quantity,
      };
    });

    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalPrice = items.reduce((acc, i) => acc + i.totalPrice, 0);

    const response: CartResponse = {
      id: cart.id,
      sessionId: cart.sessionId,
      items,
      totalPrice,
      totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    return toDto(response, ReadCartDto);
  }
}
