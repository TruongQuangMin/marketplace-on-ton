import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartController } from './carts.controller';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';

@Module({
  providers: [CartService,PrismaService, ProductService],
  controllers: [CartController],
  exports: [CartService]
})
export class CartsModule {}
