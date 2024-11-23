import { Controller, Post, Body, Get, Param, Patch, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { Public } from '../auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post()
  async createOrder(
    @Req() req: Request,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const token = authHeader.split(' ')[1];
    let userId: string;

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      userId = decoded.id;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }

    createOrderDto.user_id = userId;
    return this.ordersService.create(createOrderDto);
  }

  @Public()
  @Get('history')
  async getOrderHistory(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const token = authHeader.split(' ')[1];
    let userId: string;

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      userId = decoded.id;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
    return this.ordersService.getOrderHistory(userId);
  }

  @Public()
  @Patch(':order_id/status')
  async updateOrderStatus(
    @Param('order_id') order_id: string,
    @Body('status') status: string,
  ) {
    return await this.ordersService.updateOrderStatus(order_id, status);
  }

  @Public()
  @Post(':order_id/send-invoice')
  async sendInvoice(
    @Param('order_id') orderId: string,
    @Body('userEmail') userEmail: string,
  ) {
    return await this.ordersService.sendInvoiceEmail(orderId, userEmail);
  }
}
