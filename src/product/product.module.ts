import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { PrismaService } from 'src/prisma.service';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService],
  exports: [ProductService]
})
export class ProductModule {}
