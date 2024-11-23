import { Module } from '@nestjs/common';
import { CartService } from './carts.service';
import { CartController } from './carts.controller';
import { PrismaService } from 'src/prisma.service';
import 'dotenv/config';
import { JwtModule } from '@nestjs/jwt';
const SECRET = process.env.SECRET!;

@Module({
  imports: [JwtModule.register({ secret: SECRET })],
  providers: [CartService, PrismaService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartsModule {}
