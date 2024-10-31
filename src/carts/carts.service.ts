import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma.service';
  import { CartDto } from './dto/cart.dto';
  // import { v4 as uuidv4 } from 'uuid';
  import { v4 as uuidv4, validate as isUUID } from 'uuid';
  
  @Injectable()
  export class CartService {
    constructor(private prisma: PrismaService) {}

async addToCart(
  sessionId: string | null | undefined, // Cho phép sessionId là null hoặc không có
  userId: string | null, 
  productId: string, 
  amount: number
): Promise<CartDto> {
  // Nếu sessionId không tồn tại, tự động tạo UUID mới
  const generatedSessionId = sessionId || uuidv4(); 

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

    const searchConditions: any = {
      product_id: productId,
    };
    
    if (userId) {
      searchConditions.user_id = userId;
    } else {
      searchConditions.session_id = generatedSessionId; // Nếu không có userId, sử dụng session_id
    }
    // Tìm sản phẩm trong giỏ hàng của người dùng
    const existingCartItem = await prisma.carts.findFirst({
      where: searchConditions,
    });

    let cartItem;

    if (existingCartItem) {
      throw new ConflictException('Product already in cart');
    } else {
      // Nếu không tồn tại, thêm mới sản phẩm vào giỏ hàng
      cartItem = await prisma.carts.create({
        data: {
          id: uuidv4(),
          user_created: userId,
          user_id: userId,
          session_id: generatedSessionId,
          product_id: productId,
          amount,
          date_created: new Date(),
        },
      });
    }

    return { cartItem, product };
  });

  const { cartItem, product } = result;

  // Trả về thông tin sản phẩm đã thêm vào giỏ hàng
  return {
    id: cartItem.id,
    user_created: cartItem.user_created,
    user_id: cartItem.user_id,
    session_id: cartItem.session_id,
    product_id: cartItem.product_id,
    amount: cartItem.amount,
    product_name: product.name,
    product_price: product.price.toNumber(),
    product_image: product.image,
  };
}

    
    

    async getCartItems(userId: string | null, sessionId: string | null): Promise<CartDto[]> {
      // Xác định điều kiện tìm kiếm
      const whereCondition = userId 
        ? { user_id: userId } 
        : { session_id: sessionId }; // Sử dụng sessionId nếu userId là null
    
      // Lấy tất cả sản phẩm trong giỏ hàng dựa trên userId hoặc sessionId
      const cartItems = await this.prisma.carts.findMany({
        where: whereCondition,
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
              session_id: item.session_id,
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
  userId: string | null,
  sessionId: string | null,
  productId: string,
  newAmount: number,
): Promise<{ message: string; updatedItem: CartDto }> {
  // Xác định điều kiện tìm kiếm giỏ hàng
  const whereCondition = userId 
    ? { user_id: userId, product_id: productId } 
    : { session_id: sessionId, product_id: productId }; // Sử dụng sessionId nếu userId là null

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const cartItem = await this.prisma.carts.findFirst({
    where: whereCondition,
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
      session_id: updatedCartItem.session_id,
      product_id: updatedCartItem.product_id,
      amount: updatedCartItem.amount,
    },
  };
}

    
      // Phương thức xóa sản phẩm khỏi giỏ hàng
      async removeCartItem(
        userId: string | null,
        sessionId: string | null,
        productId: string,
      ): Promise<{ message: string }> {
        // Xác định điều kiện tìm kiếm sản phẩm trong giỏ hàng
        const whereCondition = userId 
          ? { user_id: userId, product_id: productId } 
          : { session_id: sessionId, product_id: productId }; // Sử dụng sessionId nếu userId là null
      
        // Kiểm tra sản phẩm có trong giỏ hàng không
        const cartItem = await this.prisma.carts.findFirst({
          where: whereCondition,
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
      
      async clearCart(
        userId: string | null,
        sessionId: string | null,
      ): Promise<{ message: string }> {
        // Xác định điều kiện xóa giỏ hàng
        const whereCondition = userId 
          ? { user_id: userId } 
          : { session_id: sessionId }; // Sử dụng sessionId nếu userId là null
      
        // Xóa toàn bộ sản phẩm trong giỏ hàng của người dùng
        await this.prisma.carts.deleteMany({
          where: whereCondition,
        });
      
        // Trả về thông báo thành công
        return { message: 'All items removed from cart successfully' };
      }
      
      async mergeCart(sessionId: string, userId: string): Promise<{ message: string }> {
        // Lấy các mục giỏ hàng từ phiên hiện tại dựa trên sessionId
        const sessionCartItems = await this.prisma.carts.findMany({
            where: { session_id: sessionId }, // Lấy giỏ hàng dựa trên session_id
        });
    
        if (sessionCartItems.length === 0) {
            return { message: 'No items to merge' }; // Nếu không có mục nào trong giỏ hàng phiên
        }
  
        // Cập nhật từng mục giỏ hàng từ phiên vào giỏ hàng của người dùng
        const mergePromises = sessionCartItems.map(async (item) => {
            // Cập nhật thông tin mục giỏ hàng
            return this.prisma.carts.update({
                where: { id: item.id }, // Xác định mục giỏ hàng
                data: {
                    user_id: userId, // Cập nhật user_id thành id của người dùng
                    session_id: null, // Đặt session_id thành null
                },
            });
        });
        // Chờ cho tất cả các Promise hoàn thành
        await Promise.all(mergePromises);
    
        return { message: 'Cart merged successfully' };
    }
    
  }
  