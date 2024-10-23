import { IsNotEmpty } from "class-validator"

export class CreatePostDto {
    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    summary: string

    @IsNotEmpty()
    content: string
    status: number

    @IsNotEmpty()
    ownerId: number

    @IsNotEmpty()
    categoryId: number
}
