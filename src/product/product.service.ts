import { Injectable } from '@nestjs/common';
import {
  NftDataDto,
  ProductResponseType,
  SearchingProduct,
} from './dto/product.dto';
import { PrismaService } from '../prisma.service';
import { products as Product } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';


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
    const sort = filters.sort === 'asc' || filters.sort === 'desc' ? filters.sort : 'asc';
    const products = await this.prismaService.products.findMany({
      where: {
        OR: [
          {
            token_id: {
              contains: search,
              mode: 'insensitive'
            },
          },
          {
            creator: {
              contains: search,
              mode: 'insensitive' // khong phan biet chu hoa
            },
          },
        ],
      },
      include: {
        directus_files: {
          select: {
            filename_download: true,
            metadata: true
          },
        }
      },
      orderBy: {
        price: sort,
      },
    });
    // console.log(products.test_json.name)

    return {
      data: products,

    };
  }

  async getDetail(id: string): Promise<Product> {
    return await this.prismaService.products.findFirst({
      where: {
        id,
      },
      include: {
        directus_files: {
          select: {
            filename_disk: true
          },
        }
      },
    });
  }

  async getNftData(data: NftDataDto) {
    // Lấy giá trị của "name" trong "test_json"
    const nameValue = data.test_json.name;
    console.log(nameValue);  // Output: "AbcXyz"
    return nameValue;
  }
}
