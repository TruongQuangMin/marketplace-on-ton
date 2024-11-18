import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  ClearWishlistDto,
  CreateWishlistDto,
  GetAllWishlistDto,
  RemoveWishlistDto,
} from './dto/wishlist.dto';
import { wishlists } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import SupabaseUtil from 'util/supabaseUtil';
// import { async } from 'rxjs';

@Injectable()
export class WishlistService {
  constructor(private prismaService: PrismaService) {}

  async addWishlist(data: CreateWishlistDto): Promise<wishlists> {
    const products = await this.prismaService.wishlists.findFirst({
      where: { user_id: data.user_id, product_id: data.product_id },
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
        user_created: data.user_id,
        user_id: data.user_id,
        product_id: data.product_id,
        date_created: new Date(), // tự động set ngày tạo
      },
    });
  }

  async getAllWishlist(userId: string): Promise<GetAllWishlistDto[]> {
    const wishlists = await this.prismaService.wishlists.findMany({
      where: { user_created: userId },
      select: {
        id: true,
        user_created: true,
        product_id: true,
        products: {
          select: {
            name: true,
            price: true,
            directus_files: {
              select: {
                filename_disk: true,
              },
            },
          },
        },
      },
    });

    if (!wishlists) {
      throw new Error("Product not found");
    }
  
    // const url = wishlists.products.directus_files?.filename_disk || '';
    const wishlistsWithPublicUrl = await Promise.all(
      wishlists.map(async (wishlist) => {
        const filename = wishlist.products?.directus_files.filename_disk || '';
        const imageUrl = filename ? await SupabaseUtil.GetPublicImageUrl(filename) : '';
        
        return {
          id: wishlist.id,
          user_created: wishlist.user_created,
          product_id: wishlist.product_id,
          products: {
            name: wishlist.products.name,
            price: wishlist.products.price,
            image: imageUrl, // Đặt URL công khai vào đây
          },
        };
      })
    );
  
    return wishlistsWithPublicUrl;
  }

  async removeFromWishlist(
    data: RemoveWishlistDto,
  ): Promise<{ message: string }> {
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
