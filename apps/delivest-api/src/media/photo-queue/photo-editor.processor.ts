import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PhotoQueuePayload } from '../interface/photo-payload.interface.js';
import { MediaService } from '../media.service.js';
import sharp from 'sharp';
import {
  PhotoConversionFailedEvent,
  PhotoConvertedEvent,
} from '../../shared/events/types.js';

@Processor('photo-editor')
@Injectable()
export class PhotoEditorProcessor extends WorkerHost {
  private readonly logger = new Logger(PhotoEditorProcessor.name);
  private readonly EXTENSION_MAP: Record<string, string> = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
    heif: 'heif',
    gif: 'gif',
    tiff: 'tiff',
    avif: 'avif',
  };

  private readonly MIME_MAP: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heif: 'image/heif',
    gif: 'image/gif',
    tiff: 'image/tiff',
    avif: 'image/avif',
  };

  constructor(
    private eventEmitter: EventEmitter2,
    private readonly mediaService: MediaService,
  ) {
    super();
  }

  async process(job: Job<PhotoQueuePayload>): Promise<void> {
    const { fileId, profile, socketId, eventType, failEventType } = job.data;

    try {
      const fileInfo = await this.mediaService.findOne(fileId);
      const s3Stream = await this.mediaService.getFileStream(fileId);

      const transformer = sharp();

      if (profile.format) {
        transformer.toFormat(profile.format, {
          quality: profile.quality || 80,
        });
      }

      if (profile.width && profile.height) {
        transformer.resize({
          width: profile.width,
          height: profile.height,
          fit: profile.fit ? sharp.fit[profile.fit] : sharp.fit.contain,
          position: profile.position || 'centre',
          background: profile.background || {
            r: 255,
            g: 255,
            b: 255,
            alpha: 1,
          },
          withoutEnlargement: true,
        });
      }

      const processedBuffer = await s3Stream.pipe(transformer).toBuffer();

      let newOriginalName = fileInfo.originalName;
      let mimeType = fileInfo.mimeType;
      if (profile.format) {
        const extension = this.EXTENSION_MAP[profile.format];
        mimeType = this.MIME_MAP[profile.format];
        newOriginalName = fileInfo.originalName.replace(
          /\.[^.]+$/,
          `.${extension}`,
        );
      }

      const convertedFile = await this.mediaService.uploadFile({
        buffer: processedBuffer,
        originalName: newOriginalName,
        mimeType: mimeType,
        size: processedBuffer.length,
      });

      const result: PhotoConvertedEvent = {
        originalFileId: fileId,
        newFileId: convertedFile.id,
        socketId: socketId,
      };

      await this.eventEmitter.emitAsync(eventType, result);
    } catch (editError) {
      this.logger.error(
        `photoWorker | Edit failed for file ${fileId}`,
        editError,
      );
      const errorMessage: PhotoConversionFailedEvent = {
        fileId: fileId,
        socketId: socketId,
        error: (editError as Error).message,
      };
      await this.eventEmitter.emitAsync(failEventType, errorMessage);
      throw editError;
    }
  }
}
