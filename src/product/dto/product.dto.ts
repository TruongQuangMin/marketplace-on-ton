import { products } from '@prisma/client';

export class UpdateProductDto {
  id: string;
  token_id?: string;
  name?: string;
  status: string;
  price?: number;
  image?: string;
  quantity?: number;
  type?: string = 'NFT';
  creator?: string;
  description?: string;
}

export class ProductDto {
  id: string;
  token_id?: string;
  name?: string;
  status: string;
  price?: number;
  image?: string;
  quantity?: number;
  type?: string = 'NFT';
  creator?: string;
  description?: string;
}

export interface SearchingProduct {
  search?: string
  sort?: string
}

export interface ProductResponseType {
  data: products[]
}


// nft-data.dto.ts
export class TestJsonDto {
  name: string;
  descriptions: string;
  attribute: string;
}

export class NftDataDto {
  id: string;
  user_created: string;
  date_created: string;
  token_id: string;
  name: string;
  price: string;
  quantity: string;
  type: string;
  creator: string;
  description: string;
  status: string;
  image: string;
  test_json: TestJsonDto;  // Đây là phần chứa name mà bạn muốn lấy
}

