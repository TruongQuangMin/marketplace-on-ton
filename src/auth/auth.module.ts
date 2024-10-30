import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import 'dotenv/config';
import { PrismaService } from 'src/prisma.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
const SECRET = process.env.SECRET!;
@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy,LocalStrategy, UserService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
