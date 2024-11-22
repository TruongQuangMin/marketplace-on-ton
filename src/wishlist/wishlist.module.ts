import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { PrismaService } from 'src/prisma.service';
import { WishlistGateway } from './wishlist.gateway';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService, PrismaService, WishlistGateway],
})
export class WishlistModule {}
