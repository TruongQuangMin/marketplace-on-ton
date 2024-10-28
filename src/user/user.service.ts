import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import SupabaseUtil from 'util/supabaseUtil';
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async register(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.password != createUserDto.confirm_password)
        return {
          status: HttpStatus.OK,
          message: 'Password and confirm password do not match',
        };
      const hashedPassword = await argon2.hash(createUserDto.password, {
        type: argon2.argon2id,
      });
      const result = await this.prismaService.directus_users.create({
        data: {
          id: uuidv4(),
          email: createUserDto.email,
          password: hashedPassword,
          role: '891efc27-6afa-4998-b93e-4cfa432fa915', //user role
        },
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Register account successful',
        result,
      };
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const user = await this.prismaService.directus_users.findUnique({
        where: { id },
      });
      if (!user) throw new NotFoundException('User not found');
      return { status: HttpStatus.OK, message: 'Result', user };
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    try {
      let fileUrl: string | null = null;
      let newFile = null;
  
      if (file) {
        fileUrl = await SupabaseUtil.Upload(file);
        const fileName = file.originalname;
        
        newFile = await this.prismaService.directus_files.create({
          data: {
            id: uuidv4(),
            storage: 'supabase',
            filename_disk: fileName,
            filename_download: fileName,
            title: fileName,
            type: file.mimetype,
            filesize: file.size,
            uploaded_on: new Date(),
          },
        });
      }
  
      const updateData: any = { ...updateUserDto };
      if (newFile) {
        updateData.avatar = newFile.id;
      }
  
      const user = await this.prismaService.directus_users.update({
        where: { id },
        data: updateData,
      });
  
      console.log( newFile);
      console.log( user);
      return {statusCode:HttpStatus.OK, message:'Update successful' }
    } catch (error) {
      console.log(error);
      throw new HttpException('Internal server error',HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

