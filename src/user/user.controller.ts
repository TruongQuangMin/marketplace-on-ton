import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { directus_users } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Get()
  @Permissions('directus_users', 'read')
  findOneEmail(@Body('email') email: string): Promise<directus_users> {
    return this.userService.findOneEmail(email);
  }
 
  @Patch('update')
  @Permissions('directus_users', 'update')
  @UseInterceptors(FileInterceptor('avatar'))
 
  async update(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(req.user);
    return this.userService.update(req.user.id, updateUserDto, file);
  }
}
