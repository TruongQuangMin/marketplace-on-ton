import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { Public } from '../auth/decorator/public.decorator';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}


  @Public()
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
  @Public()
  @Get('history/:user_id')
  async getOrderHistory(@Param('user_id') user_id: string) {
    return this.ordersService.getOrderHistory(user_id);
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
