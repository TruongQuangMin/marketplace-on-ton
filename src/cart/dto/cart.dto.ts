// import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddToCartNonLogInDto {
  product_id: string;
  amount: number;
}

export interface CartSession {
  cart: AddToCartNonLogInDto[];
  totalQuantity: number;
}

// export interface CartProduct {
//   product_id: string;
//   user_created: string;
//   amout: number;
// }
