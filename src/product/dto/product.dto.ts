import { products } from '@prisma/client';
import {
    IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  id: string;

  @IsOptional()
  @IsUUID()
  readonly user_created?: string;

  @IsOptional()
  @IsDate()
  readonly date_created?: Date;

  @IsOptional()
  @IsUUID()
  readonly user_updated?: string;

  @IsOptional()
  @IsDate()
  readonly date_updated?: Date;

  @IsNotEmpty()
  @IsString()
  token_id?: string;

  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsUUID()
  image?: string;

  @IsNotEmpty()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsString()
  type?: string = 'NFT';

  @IsNotEmpty()
  @IsString()
  creator?: string;

  @IsNotEmpty()
  @IsString()
  description?: string;
}

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
  items_per_page?: number
  page?: number
  search?: string
}

export interface ProductPaginationResponseType {
  data: products[]
  total: number
  currentPage: number
  itemsPerPage: number
}
