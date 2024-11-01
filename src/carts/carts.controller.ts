import { Controller, Post, Body, UseGuards, Get, Param, NotFoundException, Patch, ParseUUIDPipe, Delete, Query } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCartItems(
    @Query('userId') userId: string | null, 
    @Query('sessionId') sessionId: string | null, 
  ): Promise<CartDto[]> {
    const cartItems = await this.cartService.getCartItems(userId, sessionId);
    if (!cartItems || cartItems.length === 0) {
      throw new NotFoundException('Your cart is empty or products are out of stock.');
    }
    return cartItems;
  }

  @Patch('productId')
  async updateCartItemAmount(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body('userId') userId: string | null, 
    @Body('sessionId') sessionId: string | null, 
    @Body('newAmount') newAmount: number,
  ): Promise<{ message: string; updatedItem: CartDto }> {
    const result = await this.cartService.updateCartItemAmount(userId, sessionId, productId, newAmount);
    return {
      message: 'Quantity updated successfully',
      updatedItem: result.updatedItem,
    };
  }


  @Delete('productId')
  async removeCartItem(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body('userId') userId: string | null, 
    @Body('sessionId') sessionId: string | null, 
  ): Promise<{ message: string }> {
    return this.cartService.removeCartItem(userId, sessionId, productId);
  }

  @Delete('clear')
  async removeAllCartItems(
    @Body('userId') userId: string | null, 
    @Body('sessionId') sessionId: string | null,
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(userId, sessionId);
  }

  @Post('add')
  async addToCart(
    @Body('userId') userId: string | null,
    @Body('sessionId') sessionId: string | null,
    @Body('productId') productId: string,
    @Body('amount') amount: number,
    ): Promise<{message: string, CartDTO: CartDto}> {
      const result =  await this.cartService.addToCart(userId, sessionId, productId, amount);
    return {
      message: 'Product added to cart successfully',
      CartDTO: result.cartItem,
    }
  }
}
