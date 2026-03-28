import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DelivestEvent } from '../../shared/events/types.js';
import { SendAuthCodeEvent } from '../events/send-aunt-code.event.js';

@Injectable()
export class SendCodeListener {
  private readonly logger = new Logger(SendCodeListener.name);

  @OnEvent(DelivestEvent.AUTH_CODE_REQUESTED)
  handleSendAuthCode(payload: SendAuthCodeEvent) {
    this.logger.log(`пришел ивент ${payload.id} с кодом ${payload.code}`);
    throw new Error('Искусственная ошибка: SMS-шлюз недоступен!');
  }
}
