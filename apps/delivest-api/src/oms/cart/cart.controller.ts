import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators/index.js';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-item.dto.js';
import { IdParamDto } from './dto/id-param.dto.js';
import { ReadCartDto } from './dto/read-cart.dto.js';
import { SessionId } from '../../shared/decorators/session-id.decorator.js';

@ApiTags('Cart (Корзина)')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Получить текущую корзину' })
  @ApiResponse({
    status: 200,
    description: 'Данные корзины',
    type: ReadCartDto,
  })
  @ApiHeader({
    name: 'Cookie',
    description: 'Должен содержать session_id',
    required: true,
  })
  async getCart(@SessionId() sessionId: string): Promise<ReadCartDto> {
    return await this.cartService.getCart(sessionId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiResponse({
    status: 201,
    description: 'Товар успешно добавлен',
    type: ReadCartDto,
  })
  @ApiHeader({
    name: 'Cookie',
    description: 'Должен содержать session_id',
    required: true,
  })
  async addItem(@SessionId() sessionId: string, @Body() dto: AddToCartDto) {
    return await this.cartService.addItem(
      sessionId,
      dto.productId,
      dto.quantity,
    );
  }

  @Patch('remove-one/:productId')
  @ApiOperation({ summary: 'Уменьшить количество товара на 1' })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно удален',
    type: ReadCartDto,
  })
  @ApiHeader({
    name: 'Cookie',
    description: 'Должен содержать session_id',
    required: true,
  })
  async removeOne(
    @SessionId() sessionId: string,
    @Param() params: IdParamDto,
  ): Promise<ReadCartDto> {
    return await this.cartService.removeItem(
      sessionId,
      params.productId,
      false,
    );
  }

  @Delete('item/:productId')
  @ApiOperation({ summary: 'Полностью удалить позицию из корзины' })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно удален',
    type: ReadCartDto,
  })
  @ApiHeader({
    name: 'Cookie',
    description: 'Должен содержать session_id',
    required: true,
  })
  async removeAll(
    @SessionId() sessionId: string,
    @Param('productId') productId: string,
  ): Promise<ReadCartDto> {
    return await this.cartService.removeItem(sessionId, productId, true);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Очистить всю корзину' })
  @ApiHeader({
    name: 'Cookie',
    description: 'Должен содержать session_id',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Корзина успешно очищена',
  })
  async clear(@SessionId() sessionId: string) {
    await this.cartService.clearCart(sessionId);
    return { success: true, message: 'Cart cleared' };
  }
}
