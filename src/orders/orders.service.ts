import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import path from 'path';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { user_id, total_amount, products, transaction_hash } =
      createOrderDto;

    const cartItems = await this.prisma.carts.findMany({
      where: { user_id },
      include: { products: true },
    });

    if (!cartItems.length) {
      throw new BadRequestException('The user’s cart has no products.');
    }

    const productIdsInCart = cartItems.map((cart) => cart.product_id);

    const missingProducts = products.filter(
      (productId) => !productIdsInCart.includes(productId),
    );
    if (missingProducts.length > 0) {
      throw new BadRequestException(
        `The following products are not in the user’s cart: ${missingProducts.join(', ')}.`,
      );
    }

    const order = await this.prisma.orders.create({
      data: {
        id: uuidv4(),
        user_created: user_id,
        date_created: new Date(),
        total_amount,
        user_id,
        transaction_hash,
      },
    });

    await this.prisma.orders_products.createMany({
      data: products.map((productId) => ({
        orders_id: order.id,
        products_id: productId,
      })),
    });

    const orderWithProducts = await this.prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        orders_products: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                description: true,
                image: true,
                directus_files: { 
                  select: {
                    filename_disk: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Order created successfully',
      order: orderWithProducts,
    };
  }

  async getOrderHistory(user_id: string) {
    const orders = await this.prisma.orders.findMany({
      where: { user_id },
      include: {
        orders_products: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                description: true,
                image: true,
                directus_files: { 
                  select: {
                    filename_disk: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (orders.length === 0) {
      throw new NotFoundException('No orders found for this user.');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Order history retrieved successfully',
      orders: orders,
    };
  }

  async updateOrderStatus(order_id: string, status: string) {
    const existingOrder = await this.prisma.orders.findUnique({
      where: { id: order_id },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order does not exist.');
    }

    const updatedOrder = await this.prisma.orders.update({
      where: { id: order_id },
      data: { status },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Order status updated successfully',
      order: updatedOrder,
    };
  }

  async createInvoice(orderId: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        orders_products: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                description: true,
                image: true,
                directus_files: { 
                  select: {
                    filename_disk: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const invoicesDir = path.join(__dirname, '..', '..', 'invoices');


    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `invoice_${orderId}.pdf`);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    doc.pipe(fs.createWriteStream(filePath));

    doc
      .fontSize(24)
      .text('Invoice', { align: 'center', underline: true })
      .moveDown();

    doc
      .fontSize(14)
      .text(`Order ID: ${order.id}`, { align: 'left' })
      .text(`Order Date: ${order.date_created.toLocaleString()}`, {
        align: 'left',
      })
      .text(`User ID: ${order.user_created}`, { align: 'left' })
      .text(`Total Amount: $${order.total_amount}`, { align: 'left' })
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

    doc
      .fontSize(16)
      .text('Products:', { underline: true, align: 'left' })
      .moveDown();

    const columnPositions = { name: 50, quantity: 300, price: 450 };

    doc
      .fontSize(12)
      .text('Name', columnPositions.name, doc.y, { continued: true })
      .text('Quantity', columnPositions.quantity, doc.y, { continued: true })
      .text('Price', columnPositions.price, doc.y)
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

    order.orders_products.forEach((item, index) => {
      const product = item.products;
      doc
        .fontSize(12)
        .text(`${product.name}`, columnPositions.name, doc.y, {
          continued: true,
        })
        .text(`${product.quantity}`, columnPositions.quantity, doc.y, {
          continued: true,
        })
        .text(`$${product.price}`, columnPositions.price, doc.y)
        .moveDown();
    });

    doc.moveDown();

    doc
      .moveDown(2)
      .fontSize(14)
      .font('Helvetica-Bold') 
      .text(`Grand Total: $${order.total_amount}`, 400, doc.y, {
        align: 'right',
      })
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(2);

    doc
      .fontSize(10)
      .text('Thank you for your purchase!', { align: 'center' })
      .moveDown(0.5)
      .text('If you have any questions, contact support@example.com', {
        align: 'center',
      });

    doc.end();

    return filePath;
  }

  async sendInvoiceEmail(orderId: string, userEmail: string) {
    
    const filePath = await this.createInvoice(orderId);

    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

   
    await transporter.sendMail({
      from: 'dinhduyid03@gmail.com',
      to: userEmail,
      subject: `Invoice for Order ${orderId}`,
      text: 'Please find attached your order invoice.',
      attachments: [
        {
          filename: `invoice_${orderId}.pdf`,
          path: filePath,
        },
      ],
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice sent successfully',
    };
  }
}
