import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';
import { PrismaService } from './prisma.service';
import { ProductModule } from './product/product.module';

@Module({
  imports: [ProductModule, WishlistModule, CartModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
