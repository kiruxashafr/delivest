import {
  AccessClientTokenPayload,
  RefreshClientTokenPayload,
} from '@delivest/types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service.js';
import { toDto } from '../../utils/to-dto.js';
import { CreateClientDto } from './dto/create.dto.js';
import { ReadClientDto } from './dto/read.dto.js';
import {
  BadRequestException,
  InvalidCredentialsException,
  NotFoundException,
  UserNotRegisteredException,
} from '../../shared/exception/domain_exception/domain-exception.js';
import { Client } from '../../../generated/prisma/client.js';
import { LoginClientDto } from './dto/login.dto.js';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {
    this.accessTtl = +this.config.get<number>('JWT_ACCESS_TTL_SECONDS', 900);
    this.refreshTtl = +this.config.get<number>(
      'JWT_REFRESH_TTL_SECONDS',
      604800,
    );
    this.accessSecret = this.config.get<string>('JWT_ACCESS_SECRET', '');
    this.refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET', '');
  }

  async create(dto: CreateClientDto): Promise<ReadClientDto> {
    try {
      const passwordHash = dto.password
        ? await argon2.hash(dto.password)
        : null;
      const client = await this.prisma.client.create({
        data: {
          phone: dto.phone,
          passwordHash: passwordHash,
        },
      });
      this.logger.log(`create() | Client created | id=${client.id}`);
      return toDto(client, ReadClientDto);
    } catch (error: unknown) {
      this.logger.error(
        `create() | ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to create account');
    }
  }

  async validateCredentials(dto: LoginClientDto): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { phone: dto.phone },
    });
    if (!client) {
      throw new NotFoundException();
    }
    if (!client.passwordHash) {
      throw new UserNotRegisteredException();
    }
    const isPasswordValid = await argon2.verify(
      client.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    return client;
  }

  async generateAccessToken(client: Client): Promise<string> {
    const payload: AccessClientTokenPayload = {
      phone: client.phone,
      sub: client.id,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: this.accessTtl,
      secret: this.accessSecret,
    });
  }

  async generateRefreshToken(client: Client): Promise<string> {
    const payload: RefreshClientTokenPayload = {
      sub: client.id,
      phone: client.phone,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: this.refreshTtl,
      secret: this.refreshSecret,
    });
  }

  setRefreshCookie(res: Response, token: string): void {
    const refreshMaxAge = this.refreshTtl * 1000;

    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: refreshMaxAge,
    });
  }
}
