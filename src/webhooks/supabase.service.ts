// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { lastValueFrom } from 'rxjs';
// import { Buffer } from 'buffer';

// @Injectable()
// export class ImageTransferService {
//   private supabase: SupabaseClient;

//   constructor(private httpService: HttpService) {
//     const supabaseUrl = process.env.SUPABASE_URL;
//     const supabaseKey = process.env.SUPABASE_KEY;

//     if (!supabaseUrl || !supabaseKey) {
//       throw new Error('Supabase URL và API Key phải được cấu hình');
//     }

//     this.supabase = createClient(supabaseUrl, supabaseKey);
//   }

//   async transferImageFromDirectus(imageId: string): Promise<string> {
//     const directusUrl = process.env.DIRECTUS_URL; // URL của Directus
//     const directusToken = process.env.DIRECTUS_API_TOKEN; // API Token của Directus

//     // Lấy hình ảnh từ Directus
//     const imageResponse = await lastValueFrom(
//       this.httpService.get(`${directusUrl}/items/images/${imageId}`, {
//         headers: {
//           Authorization: `Bearer ${directusToken}`,
//         },
//       }),
//     );

//     const imageData = imageResponse.data.data; // Dữ liệu hình ảnh từ Directus

//     if (!imageData || !imageData.image) {
//       throw new Error('Hình ảnh không tồn tại trong Directus');
//     }

//     const imageBuffer = await this.fetchImageBuffer(imageData.image); // Lấy Buffer hình ảnh
//     const publicUrl = await this.uploadImageToSupabase(imageData.filename, imageBuffer, imageData.mime_type);

//     return publicUrl; // Trả về URL công khai của hình ảnh
//   }

//   private async fetchImageBuffer(imageUrl: string): Promise<Buffer> {
//     const response = await lastValueFrom(this.httpService.get(imageUrl, { responseType: 'arraybuffer' }));
//     return Buffer.from(response.data); // Chuyển đổi dữ liệu sang Buffer
//   }

//   private async uploadImageToSupabase(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
//     const { data, error } = await this.supabase.storage
//       .from('your-supabase-bucket') // Thay đổi tên bucket theo nhu cầu
//       .upload(`images/${fileName}`, fileBuffer, { contentType });

//     if (error) {
//       throw new Error(`Failed to upload image to Supabase: ${error.message}`);
//     }

//     const { publicUrl } = this.supabase.storage.from('your-supabase-bucket').getPublicUrl(`images/${fileName}`);

//     if (!publicUrl) {
//       throw new Error('Không thể tạo URL công khai cho hình ảnh trên Supabase');
//     }

//     return publicUrl; // Trả về URL công khai của hình ảnh
//   }
// }
