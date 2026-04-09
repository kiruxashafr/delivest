import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PhotoQueuePayload } from '../interface/photo-payload.interface.js';
import { PhotoEditResult } from '../interface/photo-editor-result.interface.js';

@Injectable()
export class PhotoQueueService {
  private readonly logger = new Logger(PhotoQueueService.name);

  constructor(
    @InjectQueue('photo-editor')
    private readonly photoEditorQueue: Queue<
      PhotoQueuePayload,
      PhotoEditResult
    >,
  ) {}

  async sendToPhotoEditor(data: PhotoQueuePayload): Promise<void> {
    try {
      const job = await this.photoEditorQueue.add(
        'photo-editor',
        {
          fileId: data.fileId,
          profile: data.profile,
          socketId: data.socketId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: 10,
        },
      );

      this.logger.log(`Photo job added: ${job.id} for file ${data.fileId}`);
    } catch (error) {
      this.logger.error(
        `Failed to add photo job for file ${data.fileId}`,
        error,
      );
      throw error;
    }
  }
}
