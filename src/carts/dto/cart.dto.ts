// src/cart/dto/cart.dto.ts
import { IsNotEmpty, IsString, IsInt,IsUUID } from 'class-validator';

export class CartDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  user_created: string;

  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  product_name?: string;
  product_price?: number;
  product_image?: string;
}
