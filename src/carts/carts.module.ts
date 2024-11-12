import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartController } from './carts.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [CartService,PrismaService],
  controllers: [CartController],
  exports: [CartService]
})
export class CartsModule {}
