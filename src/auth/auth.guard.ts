import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import 'dotenv/config';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { UserAuth } from './interface/user-auth';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';

const SECRET = process.env.SECRET!;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private user_service: UserService,
    private jwt_service: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // IsPublic
    const is_public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (is_public) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.exTrasTokenFromheader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // Auth jwt
      const user_payload: UserAuth = await this.jwt_service.verifyAsync(token, {
        secret: SECRET,
      });
      request['user'] = user_payload;

      // Check permissions decorator
      const requiredPermissions = this.reflector.get<{
        collection: string;
        actions: string;
      }>('permissions', context.getHandler());
      if (requiredPermissions) {
        const { collection, actions } = requiredPermissions;

        const userPolicies = await this.getUserPolicies(user_payload.role);

        if (!this.hasPermission(userPolicies, collection, actions)) {
          throw new ForbiddenException(
            'You do not have permission to perform this action.',
          );
        }
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  private exTrasTokenFromheader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getUserPolicies(roleId: string) {
    const { id } = await this.prismaService.directus_roles.findFirst({
      where: { name: 'Administrator' },
    });
    const { token } = await this.prismaService.directus_users.findFirst({
      where: { role: id },
    });

    const response = await fetch('http://localhost:8055/policies?fields=*.*', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Internal server error');
    }

    const policies = await response.json();
    const userPolicies = policies.data.filter((policy) =>
      policy.roles.some((role) => role.role === roleId),
    );
    return userPolicies;
  }

  private hasPermission(policies, collection: string, action: string): boolean {
    return policies.some((policy) =>
      policy.permissions.some(
        (permission) =>
          permission.collection === collection && permission.action === action,
      ),
    );
  }
}

/*  import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import 'dotenv/config';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { UserAuth } from './interface/user-auth';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const SECRET = process.env.SECRET!;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private jwt_service: JwtService,
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPoliciesFromCache() {
    const cacheKey = 'policies:all';
    const cachedResponse = await this.cacheManager.get(cacheKey);
    console.log(cachedResponse);

    if (cachedResponse) {
      console.log('policies cache');

      return cachedResponse;
    }
    const { id } = await this.prismaService.directus_roles.findFirst({
      where: { name: 'Administrator' },
    });
    const { token } = await this.prismaService.directus_users.findFirst({
      where: { role: id },
    });

    const response = await fetch('http://localhost:8055/policies?fields=*.*', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Internal server error');
    }
    const data = await response.json();
    await this.cacheManager.set(cacheKey, data, 0);
    console.log('set cache');

    return data;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const is_public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (is_public) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.exTrasTokenFromheader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // Auth JWT
      const user_payload = await this.jwt_service.verifyAsync(token, {
        secret: process.env.SECRET,
      });
      request['user'] = user_payload;
      console.log('Auth JWT');

      const requiredPermissions = this.reflector.get<{
        collection: string;
        actions: string;
      }>('permissions', context.getHandler());
      console.log('Permissions');

      if (requiredPermissions) {
        const { collection, actions } = requiredPermissions;
        const policies = await this.getPoliciesFromCache();
        const userPolicies = policies.data.filter((policy) =>
          policy.roles.some((role) => role.role === user_payload.role),
        );
        if (!this.hasPermission(userPolicies, collection, actions)) {
          throw new ForbiddenException(
            'You do not have permission to perform this action.',
          );
        }
      }
      return true;
    } catch (error) {
      console.log(error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  private hasPermission(policies, collection: string, action: string): boolean {
    return policies.some((policy) =>
      policy.permissions.some(
        (permission) =>
          permission.collection === collection && permission.action === action,
      ),
    );
  }

  private exTrasTokenFromheader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 
 */
