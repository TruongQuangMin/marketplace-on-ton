// src/cart/dto/cart.dto.ts
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CartDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  user_created: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  product_id: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  // Thêm thông tin sản phẩm (có thể mở rộng theo nhu cầu)
  product_name?: string;
  product_price?: number;
  product_image?: string;
}
