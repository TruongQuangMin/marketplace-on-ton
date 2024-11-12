import { Controller, Post, Body, Inject, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CartService } from '../carts/carts.service';
import { SignInDTO } from './dto/sign-in.dto';
import { Public } from '../auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,) {}

    @Public()
    @Post('login')
    async login(
      @Body() signInDto: SignInDTO,
      @Body('sessionId') sessionId: string,
    ): Promise<{ message: string; token?: string }> {
      const token = await this.authService.Login(signInDto.email, signInDto.password);
  
      if (!token) {
        return { message: 'Invalid email or password' };
      }
  
      if (sessionId) {
        const decodedToken = this.jwtService.verify(token.token) as { id: string };
        
        if (decodedToken?.id) {
          await this.cartService.mergeCart(sessionId, decodedToken.id);
        } else {
          return { message: 'User ID not found in token' };
        }
      }
  
      return { message: 'Login successful and cart merged if applicable', token };
    }
  }

  /*   @Public()
  @Get('delete_cache')
  async handleDirectusPoliciesUpdate(@Body() body: any) {
    console.log('Webhook Triggered:', body);
    const cacheKey = 'policies:all';
    await this.cacheManager.del(cacheKey)
    console.log('Cache invalidated:', cacheKey);
  } */

