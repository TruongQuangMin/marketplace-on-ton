import { Controller, Post, Req, Body, Delete, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartNonLogInDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Thêm sản phẩm vào giỏ hàng
  @Post('add')
  addToCart(@Req() req, @Body() product: AddToCartNonLogInDto) {
    return this.cartService.addToCartNonLogIn(req.session, product);
  }

  @Get('view')
  viewCart(@Req() req) {
    return this.cartService.viewCart(req.session);
  }

  // Xóa giỏ hàng
  @Delete('clear')
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.session);
  }
}
