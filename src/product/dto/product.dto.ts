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

export interface ProductFilterType {
  search?: string
  items_per_page?: number
  page?: number
  price?: number
  sort?: string
}

export interface ProductPaginationResponseType {
  data: products[]
  total: number
  currentPage: number
  itemsPerPage: number
}
