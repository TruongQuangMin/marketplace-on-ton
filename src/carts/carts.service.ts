import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CartDto } from './dto/cart.dto';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}
  
  async addToCart(
    userId: string | null, 
    sessionId: string | null | undefined,
    productId: string, 
    amount: number
  ): Promise<{ message: string; cartItem: CartDto }> {
    // Nếu sessionId không tồn tại, tự động tạo UUID mới
    const generatedSessionId = sessionId || uuidv4();
  
    // Kiểm tra sản phẩm có tồn tại không
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
    });
  
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    // Kiểm tra nếu số lượng sản phẩm có đủ để thêm vào giỏ hàng
    if (product.quantity < amount) {
      throw new BadRequestException('Not enough stock available');
    }
  
    const searchConditions = {
      product_id: productId,
      ...(userId ? { user_id: userId } : { session_id: generatedSessionId }),
    };
  
    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa cho userId hoặc sessionId
    const existingCartItem = await this.prisma.carts.findFirst({
      where: searchConditions,
      include: { products: true },
    });
  
    if (existingCartItem) {
      throw new ConflictException('Product already in cart');
    }
  
    // Thêm sản phẩm vào giỏ hàng nếu chưa có
    const cartItem = await this.prisma.carts.create({
      data: {
        id: uuidv4(),
        user_created: userId || null, 
        user_id: userId || null,
        session_id: userId ? null : generatedSessionId,
        product_id: productId,
        amount,
        date_created: new Date(),
      },
    });
  
    return {
      message: 'Product added to cart successfully',
      cartItem: {
        id: cartItem.id,
        user_created: cartItem.user_created,
        user_id: cartItem.user_id,
        session_id: cartItem.session_id,
        product_id: cartItem.product_id,
        amount: cartItem.amount,
        product_name: product.name,
        product_price: product.price.toNumber(),
        product_image: product.image,
      },
    };
  }
  
  
  

  async getCartItems(userId: string | null, sessionId: string | null): Promise<{ items: CartDto[], totalAmount: number }> {
    if (userId && sessionId) {
      throw new BadRequestException('Please provide either userId or sessionId, not both.');
    }
    
    const whereCondition = userId
      ? { user_id: userId }
      : { session_id: sessionId };
  
    const cartItems = await this.prisma.carts.findMany({
      where: whereCondition,
      include: { products: true },
    });
  
    const remainingItems: CartDto[] = [];
    let totalAmount = 0;
  
    for (const item of cartItems) {
      const product = item.products;
  
      if (product.quantity <= 0) {
        await this.prisma.carts.delete({ where: { id: item.id } });
      } else {
        remainingItems.push({
          id: item.id,
          user_created: item.user_created,
          user_id: item.user_id,
          session_id: item.session_id,
          product_id: item.product_id,
          amount: item.amount,
          product_name: product.name,
          product_price: product.price.toNumber(),
          product_image: product.image,
        });
  
        totalAmount += product.price.toNumber() * item.amount; 
      }
    }
  
    return { items: remainingItems, totalAmount };
  }
  
  

  async updateCartItemAmount(
    userId: string | null,
    sessionId: string | null,
    productId: string,
    newAmount: number
  ): Promise<{ message: string; updatedItem: CartDto }> {
    if (userId && sessionId) {
      throw new BadRequestException('Please provide either userId or sessionId, not both.');
    }
    const whereCondition = userId
      ? { user_id: userId, product_id: productId }
      : { session_id: sessionId, product_id: productId };

    const cartItem = await this.prisma.carts.findFirst({
      where: whereCondition,
      include: { products: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.products.quantity < newAmount) {
      throw new BadRequestException('Not enough stock available');
    }

    const updatedCartItem = await this.prisma.carts.update({
      where: { id: cartItem.id },
      data: { amount: newAmount },
    });

    return {
      message: 'Quantity updated successfully',
      updatedItem: {
        id: updatedCartItem.id,
        user_created: updatedCartItem.user_created,
        user_id: updatedCartItem.user_id,
        session_id: updatedCartItem.session_id,
        product_id: updatedCartItem.product_id,
        amount: updatedCartItem.amount,
        product_name: cartItem.products.name,
        product_price: cartItem.products.price.toNumber(),
        product_image: cartItem.products.image,
      },
    };
  }

  async removeCartItem(
    userId: string | null,
    sessionId: string | null,
    productId: string
  ): Promise<{ message: string }> {
    if (userId && sessionId) {
      throw new BadRequestException('Please provide either userId or sessionId, not both.');
    }
    const whereCondition = userId
      ? { user_id: userId, product_id: productId }
      : { session_id: sessionId, product_id: productId };

    const cartItem = await this.prisma.carts.findFirst({
      where: whereCondition,
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.carts.delete({
      where: { id: cartItem.id },
    });

    return { message: 'Cart item removed successfully' };
  }

  async clearCart(
    userId: string | null,
    sessionId: string | null
  ): Promise<{ message: string }> {
    if (userId && sessionId) {
      throw new BadRequestException('Please provide either userId or sessionId, not both.');
    }
    const whereCondition = userId
      ? { user_id: userId }
      : { session_id: sessionId };

    await this.prisma.carts.deleteMany({
      where: whereCondition,
    });

    return { message: 'All items removed from cart successfully' };
  }

  async mergeCart(sessionId: string, userId: string): Promise<{ message: string }> {
    const sessionCartItems = await this.prisma.carts.findMany({
      where: { session_id: sessionId },
    });
  
    if (sessionCartItems.length === 0) {
      return { message: 'No items to merge' };
    }
  
    for (const item of sessionCartItems) {
      await this.prisma.carts.update({
        where: { id: item.id },
        data: {
          user_id: userId,
          session_id: null,
        },
      });
    }
  
    return { message: 'Cart merged successfully' };
  }
  
}
