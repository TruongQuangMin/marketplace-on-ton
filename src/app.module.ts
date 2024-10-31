import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartsModule } from './carts/carts.module';
import { PrismaService } from './prisma.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ProductModule, WishlistModule, UserModule, CartsModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
