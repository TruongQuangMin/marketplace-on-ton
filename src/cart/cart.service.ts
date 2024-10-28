import { Injectable } from '@nestjs/common';
// import { carts } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AddToCartNonLogInDto, CartSession } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}

  async addToCartNonLogIn(session: CartSession, product: AddToCartNonLogInDto) {
    // Khởi tạo giỏ hàng nếu chưa có
    if (!session.cart) {
      session.cart = [];
    }

    // Thêm sản phẩm vào giỏ hàng
    session.cart.push(product);
    session.totalQuantity += product.amount;

    return {
      message: 'Product added to the cart successfully!!!',
      cart: session.cart,
    };
  }

  async viewCart(session: any) {
    return {
      cart: session.cart || [],
      totalQuantity: session.totalQuantity || 0,
    };
  }

  // Xóa giỏ hàng
  async clearCart(session: any) {
    session.cart = []; // Đặt giỏ hàng về rỗng
    return { message: 'Cart cleared', cart: session.cart };
  }
}
