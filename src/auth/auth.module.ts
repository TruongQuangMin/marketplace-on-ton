import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import 'dotenv/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
const SECRET = process.env.SECRET!;
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    UserModule,
    CacheModule.register(),
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
