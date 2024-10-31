import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { config } from 'dotenv';

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'TruongQuangMinh12102002', // Chuỗi bí mật cho session
      resave: false,
      
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // Thời gian tồn tại của session (1 ngày)
        secure: false,
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
