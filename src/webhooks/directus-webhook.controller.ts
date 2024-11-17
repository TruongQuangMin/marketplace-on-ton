import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
// import { ImageTransferService } from './supabase.service';
// import { ImageTransferService } from './image-transfer.service';

// @Controller('images')
// export class ImagesController {
//   constructor(private readonly imageTransferService: ImageTransferService) {}

//   @Get(':id/transfer')
//   async transferImage(@Param('id') id: string): Promise<string> {
//     return this.imageTransferService.transferImageFromDirectus(id);
//   }
// }

@Controller('webhook')
export class WebhookController {
  @Post()
  handleWebhook(@Body() payload: any): string {
    console.log('Received webhook:', payload);

    // Thực hiện các xử lý khác ở đây, ví dụ lưu dữ liệu hoặc gửi thông báo
    if (payload && payload.event) {
      return 'Webhook received successfully!';
    } else {
      throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
    }
  }
}
