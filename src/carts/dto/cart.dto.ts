// src/cart/dto/cart.dto.ts
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CartDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  user_created: string;

  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  product_id: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsString()
  session_id: string;

  product_name?: string;
  product_price?: number;
  product_image?: string;
}
