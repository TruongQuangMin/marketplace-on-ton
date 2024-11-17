import { IsArray, IsNotEmpty, IsString, IsUUID, IsInt } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsInt()
  total_amount: number;

  @IsString()
  transaction_hash: string;

  @IsArray()
  @IsUUID('all', { each: true })
  products: string[];
}
