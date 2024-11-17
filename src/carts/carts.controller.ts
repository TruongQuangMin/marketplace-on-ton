import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
  ParseUUIDPipe,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './carts.service';
import { CartDto } from './dto/cart.dto';
import { Public } from '../auth/decorator/public.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  async getCartItems(
    @Query('userId') userId: string | null,
    @Query('sessionId') sessionId: string | null,
  ): Promise<{ items: CartDto[]; totalAmount: number }> {
    const { items, totalAmount } = await this.cartService.getCartItems(
      userId,
      sessionId,
    );

    if (!items || items.length === 0) {
      throw new NotFoundException(
        'Your cart is empty or products are out of stock.',
      );
    }

    return { items, totalAmount };
  }
  @Public()
  @Patch('productId')
  async updateCartItemAmount(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body('userId') userId: string | null,
    @Body('sessionId') sessionId: string | null,
    @Body('newAmount') newAmount: number,
  ): Promise<{ message: string; updatedItem: CartDto }> {
    const result = await this.cartService.updateCartItemAmount(
      userId,
      sessionId,
      productId,
      newAmount,
    );
    return {
      message: 'Quantity updated successfully',
      updatedItem: result.updatedItem,
    };
  }

  @Public()
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
  @Public()
  @Post('add')
  async addToCart(
    @Body('userId') userId: string | null,
    @Body('sessionId') sessionId: string | null,
    @Body('productId') productId: string,
    @Body('amount') amount: number,
  ): Promise<{ message: string; CartDTO: CartDto }> {
    const result = await this.cartService.addToCart(
      userId,
      sessionId,
      productId,
      amount,
    );
    return {
      message: 'Product added to cart successfully',
      CartDTO: result.cartItem,
    };
  }

  // @Post('merge')
  // async mergeCart(
  //   @Body('sessionId') sessionId: string | null,
  //   @Body('userId') userId: string,
  // ): Promise<{ message: string }> {
  //   if (!sessionId || !userId) {
  //     throw new BadRequestException('sessionId and userId are required');
  //   }

  //   return this.cartService.mergeCart(sessionId, userId);
  // }
}
