import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
const SECRET = process.env.SECRET!;

@Module({
  imports: [JwtModule.register({ secret: SECRET })],
  providers: [OrdersService,PrismaService],
  controllers: [OrdersController]
})
export class OrdersModule {}
