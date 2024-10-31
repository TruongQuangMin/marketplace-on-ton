import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CartService } from '../carts/carts.service'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private cartService: CartService 
    ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    req.session.userId = req.user.id;
    console.log('login controller', req.user);
    await this.cartService.mergeCart(req.session.id, req.user.id);
    return this.authService.login(req.user); 
  }
}
