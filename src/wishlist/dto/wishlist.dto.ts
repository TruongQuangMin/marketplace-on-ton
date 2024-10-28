import { IsNotEmpty, IsUUID } from "class-validator"

export class CreateWishlistDto {
    @IsNotEmpty()
    @IsUUID()
    user_created: string

    @IsNotEmpty()
    @IsUUID()
    user_id: string

    @IsNotEmpty()
    @IsUUID()
    product_id: string
   
}

export class RemoveWishlistDto {
    @IsNotEmpty()
    @IsUUID()
    user_created: string

    @IsNotEmpty()
    @IsUUID()
    product_id: string
}

export class ClearWishlistDto {
    @IsNotEmpty()
    @IsUUID()
    user_created: string
}

