import { Body, Controller, Post } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) { }

    @Post()
    create(@Body() data: CreatePostDto): Promise<PostModel> {
        return this.postService.create(data)
    }
}
