import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ClearWishlistDto, CreateWishlistDto, RemoveWishlistDto } from './dto/wishlist.dto';
import { wishlists } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WishlistService {
  constructor(private prismaService: PrismaService) {}

  async addWishlist(data: CreateWishlistDto): Promise<wishlists> {
    const products = await this.prismaService.wishlists.findFirst({
      where: { user_created: data.user_created, product_id: data.product_id },
    });

    if (products) {
      throw new HttpException(
        { message: 'Product already exists in wishlist' },
        HttpStatus.OK,
      );
    }

    return await this.prismaService.wishlists.create({
      data: {
        id: uuidv4(), // hoặc để tự động tạo UUID
        user_created: data.user_created,
        user_id: data.user_created,
        product_id: data.product_id,
        date_created: new Date(), // tự động set ngày tạo
      },
    });
  }

  async removeFromWishlist(data: RemoveWishlistDto): Promise<{ message: string }> {
    const deleted = await this.prismaService.wishlists.deleteMany({
      where: {
        user_id: data.user_created,
        product_id: data.product_id,
      },
    });

    if (deleted.count === 0) {
      throw new HttpException(
        { message: 'Wishlist item not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return { message: 'Product removed from wishlist successfully' };
  }

  // Xóa toàn bộ wishlist của người dùng
  async clearWishlist(data: ClearWishlistDto): Promise<{ message: string }> {
    await this.prismaService.wishlists.deleteMany({
      where: {
        user_created: data.user_created,
      },
    });

    return { message: 'Wishlist cleared successfully' };
  }
}
