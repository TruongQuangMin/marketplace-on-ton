import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartsModule } from './carts/carts.module';
import { PrismaService } from './prisma.service';
import { ProductModule } from './product/product.module';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
// import { SupabaseService } from './webhooks/supabase.service';

@Module({
  imports: [ProductModule, WishlistModule, UserModule, CartsModule, HttpModule, AuthModule,OrdersModule],
  controllers: [AppController, AuthController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
