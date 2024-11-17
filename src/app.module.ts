import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartsModule } from './carts/carts.module';
import { PrismaService } from './prisma.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { OrdersModule } from './orders/orders.module';
@Module({
  imports: [ProductModule, WishlistModule, UserModule, CartsModule,AuthModule, HttpModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
