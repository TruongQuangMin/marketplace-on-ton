import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class User {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  user_created?: string;

  @IsOptional()
  @IsUUID()
  user_updated?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  wallet_address?: string;
}
