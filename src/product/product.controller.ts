import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
// import { products as ProductModel } from '@prisma/client';
import { GetDetailProduct, ProductResponseType, SearchingProduct } from './dto/product.dto';
// import { v4 as uuidv4 } from 'uuid';


@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  getAll(
    @Query() params: SearchingProduct,
  ): Promise<ProductResponseType> {
    console.log('get all product => ', params);
    try {
      return this.productService.searchAll(params);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  getDetail(@Param('id') id: string): Promise<GetDetailProduct> {
    try {
      return this.productService.getDetail(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
