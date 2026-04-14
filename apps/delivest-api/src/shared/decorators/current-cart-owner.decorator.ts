import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { COOKIE_NAMES } from '@delivest/common';
import { CartOwner } from '../../oms/cart/interfaces/cart-owner.interface.js';
import type { Request } from 'express';

export const CurrentCartOwner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CartOwner => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const client = request.client;
    const cookies = request.cookies as Record<string, string | undefined>;

    const sessionId = cookies[COOKIE_NAMES.SESSION_ID];

    if (client?.sub) {
      return { clientId: client.sub };
    }

    return { sessionId };
  },
);
