import {
  Injectable,
  // InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { directus_users } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private user_service: UserService,
    private jwt_service: JwtService,
  ) {}
  async Login(email: string, password: string): Promise<any> {
    const user: any = await this.user_service.findOneEmail(email);
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = {
      id: user.id,
      email: user.email,  
      role: user.role,
    };
    console.log(payload);

    return {
      token: this.jwt_service.sign(payload),
    };
  }
}
