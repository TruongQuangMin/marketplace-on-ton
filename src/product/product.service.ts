import { Injectable } from '@nestjs/common';
import {
  GetDetailProduct,
  ProductResponseType,
  SearchingProduct,
} from './dto/product.dto';
import { PrismaService } from '../prisma.service';
// import { products as Product } from '@prisma/client';
import SupabaseUtil from 'util/supabaseUtil';
import { Decimal } from '@prisma/client/runtime/library';

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

  // async create(data: CreateProductDto): Promise<Product> {
  //   // Kiểm tra xem user_created có tồn tại trong bảng người dùng không
  //   const user = await this.prismaService.directus_users.findUnique({
  //     where: { id: data.user_created },
  //   });

  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   // Tạo sản phẩm nếu người dùng tồn tại
  //   return await this.prismaService.products.create({
  //     data: {
  //       ...data,
  //       id: uuidv4(), // Tạo UUID hợp lệ cho id
  //     },
  //   });
  // }

  async searchAll(filters: SearchingProduct): Promise<ProductResponseType> {
    const search = filters.search || '';
    const sort =
      filters.sort === 'asc' || filters.sort === 'desc' ? filters.sort : 'asc';
    const products = await this.prismaService.products.findMany({
      where: {
        OR: [
          {
            token_id: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            creator: {
              contains: search,
              mode: 'insensitive', // khong phan biet chu hoa
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        // Các trường khác mà bạn muốn
        directus_files: {
          select: {
            filename_disk: true,
          },
        },
      },
      orderBy: {
        price: sort,
      },
    });

    const productsWithUrls = await Promise.all(
      products.map(async (product) => {
        const filename = product.directus_files?.filename_disk || '';
        const publicUrl = filename ? await SupabaseUtil.GetPublicImageUrl(filename) : '';
        return {
          id: product.id,
          name: product.name,
          price: (product.price as Decimal).toNumber(),
          description: product.description,
          imageUrl: publicUrl,
        };
      }),
    );

    return {
      data: productsWithUrls,
    };
  }

  async getDetail(id: string): Promise<GetDetailProduct> {
    const dataPro = await this.prismaService.products.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        token_id: true,
        directus_files: {
          select: {
            filename_disk: true,
          },
        },
      },
    });

    if (!dataPro) {
      throw new Error('Product not found');
    }

    const url = dataPro.directus_files?.filename_disk || '';
    const urlPublic = url ? await SupabaseUtil.GetPublicImageUrl(url) : '';

    // Chuyển đổi `Decimal` thành `number` cho `price` nếu cần
    const productDetail: GetDetailProduct = {
      id: dataPro.id,
      name: dataPro.name,
      price: (dataPro.price as Decimal).toNumber(),
      quantity: dataPro.quantity,
      token_id: dataPro.token_id,
      imageUrl: urlPublic, // Gán URL công khai của ảnh
    };

    return productDetail;
  }
}
