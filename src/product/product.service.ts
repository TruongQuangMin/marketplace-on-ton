import { Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  ProductFilterType,
  ProductPaginationResponseType,
} from './dto/product.dto';
import { PrismaService } from 'src/prisma.service';
import { products as Product } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}

  // async create(data: CreateProductDto): Promise<products> {
  //     return await this.prismaService.products.create({ data: {
  //         ...data,
  //         id: uuidv4(),  // Tạo UUID hợp lệ cho id
  //         user_created: data.user_created || uuidv4(),  // Sử dụng UUID hợp lệ hoặc tạo mới
  //         // user_updated: data.user_updated || uuidv4(),
  //         image: data.image || uuidv4(),  // Nếu cần tạo image UUID
  //       },});
  //   }

  async create(data: CreateProductDto): Promise<Product> {
    // Kiểm tra xem user_created có tồn tại trong bảng người dùng không
    const user = await this.prismaService.directus_users.findUnique({
      where: { id: data.user_created },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Tạo sản phẩm nếu người dùng tồn tại
    return await this.prismaService.products.create({
      data: {
        ...data,
        id: uuidv4(), // Tạo UUID hợp lệ cho id
      },
    });
  }

  async getAll(filters: ProductFilterType): Promise<ProductPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const products = await this.prismaService.products.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            token_id: {
              contains: search,
            },
          },
          {
            creator: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        name: 'desc',
      },
    });

    const total = await this.prismaService.products.count({
      where: {
        OR: [
          {
            name: {
              contains: search as string,
            },
          },
          {
            token_id: {
              contains: search as string,
            },
          },
          {
            creator: {
              contains: search as string,
            },
          },
        ],
      },
    });

    return {
      data: products,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getDetail(id: string): Promise<Product> {
    return await this.prismaService.products
      .findFirst({
        where: {
          id,
        },
        include: {
          orders: {
            select: {
              id: true,
              transaction_hash: true,
              total_amount: true,
              date_created: true,
            },
          },
          Wishlists: {
            select: {
              id: true,
              product_id: true,
            },
          },
        },
      })
  }

  
}
