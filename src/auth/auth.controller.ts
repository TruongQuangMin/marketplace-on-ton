import { Controller, Post, Body, Inject, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

import { SignInDTO } from './dto/sign-in.dto';
import { Public } from '../auth/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('Login')
  Login(@Body() sign_in_dto: SignInDTO) {
    return this.authService.Login(sign_in_dto.email, sign_in_dto.password);
  }

  /*   @Public()
  @Get('delete_cache')
  async handleDirectusPoliciesUpdate(@Body() body: any) {
    console.log('Webhook Triggered:', body);
    const cacheKey = 'policies:all';
    await this.cacheManager.del(cacheKey)
    console.log('Cache invalidated:', cacheKey);
  } */
}
