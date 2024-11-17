import { WishlistModule } from './wishlist.module';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Request ,
  Post,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import {
  ClearWishlistDto,
  CreateWishlistDto,
  GetAllWishlistDto,
  RemoveWishlistDto,
} from './dto/wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post()
  @Permissions('wishlists', 'create')
  async create(@Body() data: CreateWishlistDto): Promise<WishlistModule> {
    try {
      return await this.wishlistService.addWishlist(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me')
  @Permissions('wishlists', 'read')
  async getAllWishlist(@Request() req): Promise<GetAllWishlistDto[]> {
    const userId = req.user.id; 
    return await this.wishlistService.getAllWishlist(userId);
  }

  @Delete()
  @Permissions('wishlists', 'delete')
  async remove(@Body() data: RemoveWishlistDto): Promise<WishlistModule> {
    try {
      return await this.wishlistService.removeFromWishlist(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear/me')
  async clear(@Body() data: ClearWishlistDto): Promise<WishlistModule> {
    try {
      return await this.wishlistService.clearWishlist(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
