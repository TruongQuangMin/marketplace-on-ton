import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CartDto } from './dto/cart.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(
    userId: string,
    productId: string,
    amount: number,
  ): Promise<{ message: string; cartItem: CartDto }> {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.quantity < amount) {
      throw new BadRequestException('Not enough stock available');
    }

    const productImage = product.image
      ? await this.prisma.directus_files.findUnique({
          where: { id: product.image },
          select: { filename_disk: true },
        })
      : null;

    const existingCartItem = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
      include: { products: true },
    });

    if (existingCartItem) {
      throw new ConflictException('Product already in cart');
    }

    const cartItem = await this.prisma.carts.create({
      data: {
        id: uuidv4(),
        user_created: userId,
        user_id: userId,
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
        product_id: cartItem.product_id,
        amount: cartItem.amount,
        product_name: product.name,
        product_price: product.price.toNumber(),
        product_image: productImage?.filename_disk || null,
      },
    };
  }

  async getCartItems(
    userId?: string,
    cartId?: string,
  ): Promise<{ items: CartDto[]; totalAmount: number }> {
    const whereClause = cartId
      ? { id: cartId } 
      : { user_id: userId }; 

    const cartItems = await this.prisma.carts.findMany({
      where: whereClause,
      include: { products: true },
    });

    const remainingItems: CartDto[] = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product = item.products;

      if (product.quantity <= 0) {
        await this.prisma.carts.delete({ where: { id: item.id } });
      } else {
        const productImage = product.image
          ? await this.prisma.directus_files.findUnique({
              where: { id: product.image },
              select: { filename_disk: true },
            })
          : null;

        remainingItems.push({
          id: item.id,
          user_created: item.user_created,
          user_id: item.user_id,
          product_id: item.product_id,
          amount: item.amount,
          product_name: product.name,
          product_price: product.price.toNumber(),
          product_image: productImage?.filename_disk || null,
        });

        totalAmount += product.price.toNumber() * item.amount;
      }
    }

    return { items: remainingItems, totalAmount };
  }

  async updateCartItemAmount(
    userId: string | null,
    cartId: string | null,
    productId: string,
    newAmount: number,
  ): Promise<{ message: string; updatedItem: CartDto }> {
    const cartItem = await this.prisma.carts.findFirst({
      where: {
        ...(userId ? { user_id: userId } : { id: cartId }),
        product_id: productId,
      },
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
      include: { products: true },
    });
  
    return {
      message: 'Quantity updated successfully',
      updatedItem: {
        id: updatedCartItem.id,
        user_created: updatedCartItem.user_created,
        user_id: updatedCartItem.user_id,
        product_id: updatedCartItem.product_id,
        amount: updatedCartItem.amount,
        product_name: updatedCartItem.products.name,
        product_price: updatedCartItem.products.price.toNumber(),
        product_image: updatedCartItem.products.image,
      },
    };
  }
  async removeCartItem(
    userId?: string,
    cartId?: string,
    productId?: string,
  ): Promise<{ message: string }> {
    const whereClause = cartId
      ? { id: cartId }
      : { user_id: userId, product_id: productId }; 

    const cartItem = await this.prisma.carts.findFirst({
      where: whereClause,
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
    userId?: string,
    cartId?: string,
  ): Promise<{ message: string }> {
    const whereClause = cartId
      ? { id: cartId } // Tìm theo `cart_id`
      : { user_id: userId }; // Tìm theo `user_id`

    const deletedCount = await this.prisma.carts.deleteMany({
      where: whereClause,
    });

    if (deletedCount.count === 0) {
      throw new NotFoundException('No cart items found to delete');
    }

    return { message: 'All items removed from cart successfully' };
  }

  async mergeCart(
    cartId: string,
    userId: string,
  ): Promise<{ message: string }> {
    if (!cartId) {
      throw new BadRequestException('Cart ID is required');
    }

    const cartItem = await this.prisma.carts.findUnique({
      where: { id: cartId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.carts.update({
      where: { id: cartId },
      data: {
        user_id: userId,
      },
    });
    return { message: 'Cart merged successfully' };
  }
}
