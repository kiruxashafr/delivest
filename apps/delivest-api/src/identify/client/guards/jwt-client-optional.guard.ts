import { AccessClientTokenPayload } from '@delivest/types';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtClientAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalJwtClientAuthGuard.name);

  private readonly accessSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.getOrThrow<string>(
      'JWT_ACCESS_SECRET_CLIENT',
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return true;
    }

    try {
      const payload = this.jwtService.verify<AccessClientTokenPayload>(token, {
        secret: this.accessSecret,
      });
      request.client = payload;
    } catch (error) {
      this.logger.error(`[OptionalJwtClientAuthGuard] error ${error}`);
    }

    return true;
  }
}
