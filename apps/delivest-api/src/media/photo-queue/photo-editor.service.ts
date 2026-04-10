import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  PhotoProfile,
  PhotoQueuePayload,
} from '../interface/photo-payload.interface.js';
import { PhotoEditResult } from '../interface/photo-editor-result.interface.js';
import { MediaService } from '../media.service.js';
import { FileUploadFailedException } from '../../shared/exceptions/domain_exception/domain-exception.js';
import { UploadFile } from '../interface/upload-file.interface.js';
import { PhotoEvent } from '../../shared/events/types.js';

@Injectable()
export class PhotoEditorService {
  private readonly logger = new Logger(PhotoEditorService.name);

  constructor(
    @InjectQueue('photo-editor')
    private readonly photoEditorQueue: Queue<
      PhotoQueuePayload,
      PhotoEditResult
    >,
    private readonly mediaService: MediaService,
  ) {}

  async uploadAndEditPhoto(
    file: UploadFile,
    profile: PhotoProfile,
    socketId: string,
    eventType: PhotoEvent,
    failEventType: PhotoEvent,
  ): Promise<void> {
    try {
      const savedFile = await this.mediaService.uploadFile(file);
      this.logger.log(
        `uploadAndEditPhoto() | Original uploaded with the new file ${savedFile.id}, mimetype: ${file.mimeType}, size: ${file.size}`,
      );

      const data: PhotoQueuePayload = {
        fileId: savedFile.id,
        profile: profile,
        socketId: socketId,
        eventType: eventType,
        failEventType: failEventType,
      };
      await this.sendToPhotoEditor(data);
    } catch (error) {
      this.logger.error(
        `uploadAndEditPhoto() | Failed to upload and edit photo: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new FileUploadFailedException();
    }
  }
  async sendToPhotoEditor(data: PhotoQueuePayload): Promise<void> {
    try {
      const job = await this.photoEditorQueue.add(
        'photo-editor',
        {
          fileId: data.fileId,
          profile: data.profile,
          socketId: data.socketId,
          eventType: data.eventType,
          failEventType: data.failEventType,
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
