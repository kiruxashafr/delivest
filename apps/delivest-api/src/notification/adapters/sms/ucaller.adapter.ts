import { IAuthCodeSender } from '@delivest/common';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import {
  UCallerInitCallRequest,
  UCallerInitCallResponse,
} from '@delivest/types';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class UCallerSmsAdapter implements IAuthCodeSender {
  private readonly logger = new Logger(UCallerSmsAdapter.name);
  private readonly initCallApiUrl = 'https://api.ucaller.ru/v1.0/initCall';
  private readonly proxyAgent: HttpsProxyAgent<string> | undefined;

  constructor(private readonly prisma: PrismaService) {
    const proxyUrl = process.env.PROXY_URL!;
    this.proxyAgent = new HttpsProxyAgent(proxyUrl);
  }

  async send(authCodeId: string): Promise<void> {
    const authRecord = await this.prisma.authMessage.findUnique({
      where: { id: authCodeId },
    });

    const payload: UCallerInitCallRequest = {
      phone: Number(authRecord?.target),
      code: String(authRecord?.code),
      unique: authCodeId,
      voice: true,
    };

    try {
      const { data } = await axios.post<UCallerInitCallResponse>(
        this.initCallApiUrl,
        payload,
        {
          httpsAgent: this.proxyAgent,
          proxy: false,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.UCALLER_SECRET_KEY ?? ''}.${process.env.UCALLER_SERVICE_ID ?? ''}`,
          },
        },
      );

      if (data.status === false || !data.ucaller_id) {
        const errorMsg = (data as any).error || 'Unknown uCaller error';
        this.logger.warn(`[uCaller] Delivery deferred: ${errorMsg}`);
        throw new Error(`uCaller_deferred: ${errorMsg}`);
      }

      await this.prisma.authMessage.update({
        where: { id: authCodeId },
        data: { callId: String(data.ucaller_id) },
      });

      this.logger.log(
        `[uCaller] Call success: ${authRecord?.target} (ID: ${data.ucaller_id})`,
      );
    } catch (error: unknown) {
      this.handleError(error, authCodeId);
    }
  }

  private handleError(error: unknown, id: string): never {
    if (axios.isAxiosError(error)) {
      const apiData = error.response?.data;
      const message = apiData?.error || error.message;
      this.logger.error(
        `[uCaller] API Failure [${id}]: ${JSON.stringify(apiData) || message}`,
      );
      throw new Error(message);
    }

    const internalMessage =
      error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(`[uCaller] Internal Failure [${id}]: ${internalMessage}`);

    throw error;
  }
}
