import { Controller, Logger } from '@nestjs/common';
import { ClientService } from './client.service.js';

@Controller('client')
export class ClientController {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly service: ClientService) {}
}
