import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import 'dotenv/config';
import { CartsModule } from 'src/carts/carts.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
const SECRET = process.env.SECRET!;

@Module({
  imports: [
    UserModule,
    CartsModule,
    JwtModule.register({ secret: SECRET }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    Reflector,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
