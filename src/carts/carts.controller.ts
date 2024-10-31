import { Controller, Post, Body, UseGuards, Get, Param, NotFoundException, Patch, ParseUUIDPipe, Delete, Query } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(
    @Body('userId') userId: string | null,  // userId có thể null
    @Body('sessionId') sessionId: string | null, // Thêm sessionId
    @Body('productId') productId: string,
    @Body('amount') amount: number,
  ): Promise<CartDto> {
    return this.cartService.addToCart(userId, sessionId, productId, amount);
  }

  @Get()
  async getCartItems(
    @Query('userId') userId: string | null, // Có thể là null
    @Query('sessionId') sessionId: string | null, // Có thể là null
  ): Promise<CartDto[]> {
    // Gọi phương thức getCartItems từ CartService để lấy giỏ hàng
    const cartItems = await this.cartService.getCartItems(userId, sessionId);
    // Nếu giỏ hàng trống sau khi xóa sản phẩm hết hàng
    if (!cartItems || cartItems.length === 0) {
      throw new NotFoundException('Your cart is empty or products are out of stock.');
    }
    return cartItems;
  }

  @Patch(':productId')
  async updateCartItemAmount(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body('userId') userId: string | null, // Có thể là null
    @Body('sessionId') sessionId: string | null, // Có thể là null
    @Body('newAmount') newAmount: number,
  ): Promise<{ message: string; updatedItem: CartDto }> {
    const result = await this.cartService.updateCartItemAmount(userId, sessionId, productId, newAmount);
    return {
      message: 'Quantity updated successfully',
      updatedItem: result.updatedItem,
    };
  }

  // Endpoint xóa sản phẩm khỏi giỏ hàng
  @Delete(':productId')
  async removeCartItem(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body('userId') userId: string | null, // Có thể là null
    @Body('sessionId') sessionId: string | null, // Có thể là null
  ): Promise<{ message: string }> {
    return this.cartService.removeCartItem(userId, sessionId, productId);
  }

  // Endpoint xóa toàn bộ giỏ hàng
  @Delete('clear')
  async removeAllCartItems(
    @Body('userId') userId: string | null, // Có thể là null
    @Body('sessionId') sessionId: string | null, // Có thể là null
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(userId, sessionId);
  }
}
