import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  ProductFilterType,
  ProductPaginationResponseType,
} from './dto/product.dto';
import { products as ProductModel } from '@prisma/client';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  create(@Body() data: CreateProductDto): Promise<ProductModel> {
    return this.productService.create(data);
  }

  @Get()
  getAll(
    @Query() params: ProductFilterType,
  ): Promise<ProductPaginationResponseType> {
    console.log('get all product => ', params);
    return this.productService.getAll(params);
  }

  @Get(':id')
  getDetail(@Param('id') id: string): Promise<ProductModel> {
    return this.productService.getDetail(id);
  }
}
