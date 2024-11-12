import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';

import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import SupabaseUtil from 'util/supabaseUtil';
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.prismaService.directus_users.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Email already exists. Please use another email.',
        };
      }

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
      console.log(error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneEmail(email: string): Promise<any> {
    try {
      console.log(`Searching for user with email: ${email}`);
      const user = await this.prismaService.directus_users.findUnique({
        where: { email }
      });

      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
      let newFile = null;
      let file_url = null;
      if (file) {
        const old_user = await this.prismaService.directus_users.findUnique({
          where: { id },
        });

        if (old_user && old_user.avatar) {
          const old_file = await this.prismaService.directus_files.findUnique({
            where: { id: old_user.avatar },
          });

          if (old_file) {
            await SupabaseUtil.Delete([old_file.filename_download]);
            await this.prismaService.directus_files.delete({
              where: { id: old_user.avatar },
            });
          }
        }
        const newFileId = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${newFileId}.${fileExtension}`;

        file_url = await SupabaseUtil.Upload(file, newFileId);
        newFile = await this.prismaService.directus_files.create({
          data: {
            id: newFileId,
            storage: 'supabase',
            filename_disk: fileName,
            filename_download: file.originalname,
            title: file.originalname,
            type: file.mimetype,
            filesize: file.size,
            uploaded_on: new Date(),
          },
        });
      }

      const updateData: any = { ...updateUserDto };
      if (newFile) {
        updateData.url = file_url;
        updateData.avatar = newFile.id;
      }

      const user = await this.prismaService.directus_users.update({
        where: { id },
        data: updateData,
      });

      console.log(newFile);
      console.log(user);
      return { statusCode: HttpStatus.OK, message: 'Update successful' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}