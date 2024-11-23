import { IsNotEmpty, IsUUID } from 'class-validator';
import { GetDetailProduct } from 'src/product/dto/product.dto';

export class CreateWishlistDto {


  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  product_id: string;
}

export class RemoveWishlistDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  product_id: string;
}

export class ClearWishlistDto {
  @IsNotEmpty()
  @IsUUID()
  user_created: string;
}

export class GetAllWishlistDto {
  id: string;
  user_created: string;
  product_id: string;
  product?: GetDetailProduct;
}
