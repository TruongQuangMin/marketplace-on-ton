import { WishlistModule } from './wishlist.module';
import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import {
  ClearWishlistDto,
  CreateWishlistDto,
  RemoveWishlistDto,
} from './dto/wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post()
  create(@Body() data: CreateWishlistDto): Promise<WishlistModule> {
    try {
      return this.wishlistService.addWishlist(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  remove(@Body() data: RemoveWishlistDto): Promise<WishlistModule> {
    try {
      return this.wishlistService.removeFromWishlist(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear/me')
  clear(@Body() data: ClearWishlistDto): Promise<WishlistModule> {
    try {
      return this.wishlistService.clearWishlist(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
