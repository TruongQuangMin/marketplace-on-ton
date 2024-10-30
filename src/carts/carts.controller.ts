import { Controller, Post, Body, UseGuards, Get,Param, NotFoundException,Patch,ParseUUIDPipe,Delete  } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Post('add')
  async addToCart(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('amount') amount: number,
  ): Promise<CartDto> {
    return this.cartService.addToCart(userId, productId, amount);
  }
  @Get(':userId')
  async getCartItems(@Param('userId') userId: string): Promise<CartDto[]> {
    // Gọi phương thức getCartItems từ CartService để lấy giỏ hàng
    const cartItems = await this.cartService.getCartItems(userId);
    // Nếu giỏ hàng trống sau khi xóa sản phẩm hết hàng
    if (!cartItems || cartItems.length === 0) {
      throw new NotFoundException('Your cart is empty or products are out of stock.');
    }
    return cartItems;
  }
  @Patch(':productId/:userId')
  async updateCartItemAmount(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Param('userId') userId: string,
    @Body('newAmount') newAmount: number,
  ): Promise<{ message: string; updatedItem: CartDto }> {
    const result = await this.cartService.updateCartItemAmount(userId, productId, newAmount);
    return {
      message: 'Quantity updated successfully',
      updatedItem: result.updatedItem,
    };
  }
  // Endpoint xóa sản phẩm khỏi giỏ hàng
  @Delete(':productId')
  async removeCartItem(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.cartService.removeCartItem(userId, productId);
  }
// Endpoint xóa toàn bộ giỏ hàng
  @Delete('clear/:userId')
  async removeAllCartItems(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(userId);
  }
}
