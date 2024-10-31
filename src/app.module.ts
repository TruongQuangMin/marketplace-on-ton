import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WishlistModule } from './wishlist/wishlist.module';
<<<<<<< HEAD
=======
import { CartsModule } from './carts/carts.module';
>>>>>>> c9a2bcdf087c6c3e2622668fd379a2277b1eb6da
import { PrismaService } from './prisma.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
<<<<<<< HEAD
  imports: [ProductModule, WishlistModule, UserModule],
=======
  imports: [ProductModule, WishlistModule, CartsModule],
>>>>>>> c9a2bcdf087c6c3e2622668fd379a2277b1eb6da
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
