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
  Req,
} from '@nestjs/common';
import { CartService } from './carts.service';
import { CartDto } from './dto/cart.dto';
import { Public } from '../auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Get()
  async getCartItems(
    @Req() req: any,
    @Body('cartId') cartId: string | null,
  ): Promise<{ items: CartDto[]; totalAmount: number }> {
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        userId = decodedToken.id;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
      }
    }

    const { items, totalAmount } = await this.cartService.getCartItems(
      userId,
      cartId,
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
    @Req() req: any,
    @Body('cartId') cartId: string | null,
    @Body('productId') productId: string,
    @Body('newAmount') newAmount: number,
  ): Promise<{ message: string; updatedItem: CartDto }> {

    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        userId = decodedToken.id;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
      }
    }
    const result = await this.cartService.updateCartItemAmount(
      userId,
      cartId,
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
    @Req() req: any,
    @Body('cartId') cartId: string | null,
    @Body('productId') productId: string,
  ): Promise<{ message: string }> {
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        userId = decodedToken.id;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
      }
    }
    return this.cartService.removeCartItem(userId, cartId, productId);
  }
  
  @Public()
  @Delete('clear')
  async removeAllCartItems(
    @Req() req: any,
    @Body('cartId') cartId: string | null,
  ): Promise<{ message: string }> {
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        userId = decodedToken.id;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
      }
    }
    return this.cartService.clearCart(userId, cartId);
  }

  @Public()
  @Post('add')
  async addToCart(
    @Req() req: any,
    @Body('productId') productId: string,
    @Body('amount') amount: number,
  ): Promise<{ message: string; cartItem: CartDto }> {
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        userId = decodedToken.id;
      } catch (error) {
        console.error('JWT verification failed:', error.message);
      }
    }
    const result = await this.cartService.addToCart(userId, productId, amount);
    return result;
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
