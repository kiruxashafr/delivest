import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
@Module({
  imports: [PrismaModule],
  providers: [CartService],
  controllers: [CartController],
  exports: [],
})
export class CartModule {}
