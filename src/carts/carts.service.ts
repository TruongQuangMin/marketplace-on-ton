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
      userId: string,
      productId: string,
      amount: number,
    ): Promise<CartDto> {
      // Sử dụng transaction để đảm bảo tính đồng bộ và khóa sản phẩm
      const result = await this.prisma.$transaction(async (prisma) => {
        // Kiểm tra sản phẩm có tồn tại không
        const product = await prisma.products.findUnique({
          where: { id: productId },
        });
  
        if (!product) {
          throw new NotFoundException('Product not found');
        }
  
        // Kiểm tra nếu số lượng sản phẩm có đủ để thêm vào giỏ hàng
        if (product.quantity < amount) {
          throw new BadRequestException('Not enough stock available');
        }
  
        // Tìm sản phẩm trong giỏ hàng của người dùng
        const existingCartItem = await prisma.carts.findFirst({
          where: { user_id: userId, product_id: productId },
        });
  
        let cartItem;
  
        if (existingCartItem) {
          // Nếu đã tồn tại, cập nhật số lượng sản phẩm trong giỏ hàng
          throw new ConflictException('Product already in cart');
        } else {
          // Nếu không tồn tại, thêm mới sản phẩm vào giỏ hàng
          cartItem = await prisma.carts.create({
            data: {
              id: uuidv4(),
              user_created: userId,
              user_id: userId,
              product_id: productId,
              amount,
              date_created: new Date(),
            },
          });
        }
        return {
          cartItem,
          product,
        };
      });
      const { cartItem, product } = result;
      // Trả về thông tin sản phẩm đã thêm vào giỏ hàng
      return {
        id: cartItem.id,
        user_created: cartItem.user_created,
        user_id: cartItem.user_id,
        product_id: cartItem.product_id,
        amount: cartItem.amount,
        product_name: product.name,
        product_price: product.price.toNumber(),
        product_image: product.image,
      };
    }

    async getCartItems(userId: string): Promise<CartDto[]> {
        // Lấy tất cả sản phẩm trong giỏ hàng của người dùng cùng với thông tin sản phẩm
        const cartItems = await this.prisma.carts.findMany({
          where: { user_id: userId },
          include: { products: true },
        });
      
        // Khởi tạo một mảng để lưu các sản phẩm còn lại sau khi kiểm tra tồn kho
        const remainingItems: CartDto[] = [];
      
        // Sử dụng transaction để đảm bảo đồng bộ khi xóa sản phẩm
        await this.prisma.$transaction(async (prisma) => {
          for (const item of cartItems) {
            const product = item.products;
      
            // Kiểm tra nếu sản phẩm hết hàng
            if (product.quantity <= 0) {
              // Xóa sản phẩm khỏi giỏ hàng nếu hết hàng
              await prisma.carts.delete({ where: { id: item.id } });
            } else {
              // Nếu còn hàng, thêm vào danh sách sản phẩm còn lại
              remainingItems.push({
                id: item.id,
                user_created: item.user_created,
                user_id: item.user_id,
                product_id: item.product_id,
                amount: item.amount,
                product_name: product.name,
                product_price: product.price.toNumber(),
                product_image: product.image,
              });
            }
          }
        });
      
        // Trả về danh sách các sản phẩm còn lại trong giỏ hàng
        return remainingItems;
      }

       // Phương thức cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItemAmount(
    userId: string,
    productId: string,
    newAmount: number,
  ): Promise<{message: string,updatedItem: CartDto}> {
    // Kiểm tra sản phẩm có trong giỏ hàng không
    const cartItem = await this.prisma.carts.findFirst({
      where: { user_id: userId, product_id: productId },
      include: { products: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Kiểm tra số lượng sản phẩm còn lại trong kho
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
    });

    if (product.quantity < newAmount) {
      throw new BadRequestException('Not enough stock available');
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    const updatedCartItem = await this.prisma.carts.update({
      where: { id: cartItem.id },
      data: { amount: newAmount },
    });

    // Trả về thông tin sản phẩm đã cập nhật
    return {
        message: 'Quantity updated successfully',
        updatedItem: {
          id: updatedCartItem.id,
          user_created: updatedCartItem.user_created,
          user_id: updatedCartItem.user_id,
          product_id: updatedCartItem.product_id,
          amount: updatedCartItem.amount,
        },
      };
    }
    
      // Phương thức xóa sản phẩm khỏi giỏ hàng
      async removeCartItem(userId: string, productId: string): Promise<{ message: string }> {
        // Kiểm tra sản phẩm có trong giỏ hàng không
        const cartItem = await this.prisma.carts.findFirst({
            where: { user_id: userId, product_id: productId },
        });
    
        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }
    
        // Xóa sản phẩm khỏi giỏ hàng
        await this.prisma.carts.delete({
            where: { id: cartItem.id },
        });
    
        // Trả về thông báo thành công
        return { message: 'Cart item removed successfully' };
    }
    
    async clearCart(userId: string): Promise<{ message: string }> {
        // Xóa toàn bộ sản phẩm trong giỏ hàng của người dùng
        await this.prisma.carts.deleteMany({
            where: { user_id: userId },
        });
        // Trả về thông báo thành công
        return { message: 'All items removed from cart successfully' };
    }
  }
  