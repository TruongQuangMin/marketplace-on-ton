import { PrismaClient } from '@prisma/client';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }


  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      console.log('App is about to exit. Closing NestJS app...');
      await app.close();
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

