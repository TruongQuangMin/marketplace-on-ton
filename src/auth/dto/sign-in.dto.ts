import { IsEmail, isEmail, IsNotEmpty } from 'class-validator';
export class SignInDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
