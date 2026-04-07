import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';

import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators/index.js';
import { COOKIE_NAMES } from '@delivest/common';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-item.dto.js';
import type { Request } from 'express';

@ApiTags('Cart (Корзина)')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiResponse({ status: 201, description: 'Товар успешно добавлен' })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации или сессия не найдена',
  })
  @ApiHeader({
    name: 'Cookie',
    description: 'Должен содержать session_id',
    required: true,
  })
  async addItem(@Req() req: Request, @Body() dto: AddToCartDto) {
    const sessionId = req.cookies[COOKIE_NAMES.SESSION_ID] as string;

    if (!sessionId) {
      throw new BadRequestException(
        'Session not initialized. Please refresh page.',
      );
    }

    await this.cartService.addItem(sessionId, dto.productId, dto.quantity);
    return { success: true };
  }
}
