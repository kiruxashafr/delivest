import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { FlowJob, FlowProducer, Queue } from 'bullmq';
import {
  ChildPhotoQueuePayload,
  ParentPhotoQueuePayload,
  PhotoQueuePayload,
} from '../interface/photo-payload.interface.js';
import { PhotoEditResult } from '../interface/photo-editor-result.interface.js';
import { MediaService } from '../media.service.js';
import { FileUploadFailedException } from '../../shared/exceptions/domain_exception/domain-exception.js';
import { UploadFile } from '../interface/upload-file.interface.js';
import { PhotoEvent } from '../../shared/events/types.js';
import { PhotoProfile } from '../photo-configs/profiles.js';

@Injectable()
export class PhotoEditorService {
  private readonly logger = new Logger(PhotoEditorService.name);

  constructor(
    @InjectQueue('photo-editor')
    private readonly photoEditorQueue: Queue<
      PhotoQueuePayload,
      PhotoEditResult
    >,
    @Inject('PHOTO_FLOW_PRODUCER')
    private readonly flow: FlowProducer,
    private readonly mediaService: MediaService,
  ) {}

  async uploadAndEditMultiple(
    targetId: string,
    file: UploadFile,
    configs: { profile: PhotoProfile; key: string }[],
    socketId: string,
    eventType: PhotoEvent,
    failEventType: PhotoEvent,
  ): Promise<void> {
    try {
      const savedFile = await this.mediaService.uploadFile(file, 'originals');

      const flowJob: FlowJob = {
        name: 'photo-finish-hub',
        queueName: 'photo-notifications',
        data: {
          targetId,
          socketId,
          succesEventType: eventType,
          failEventType: failEventType,
        } as ParentPhotoQueuePayload,
        children: configs.map((config) => ({
          name: 'photo-editor',
          queueName: 'photo-editor',
          data: {
            fileId: savedFile.id,
            profile: config.profile,
            profileKey: config.key,
          } as ChildPhotoQueuePayload,
          opts: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
          },
        })),
      };
      await this.flow.add(flowJob);

      this.logger.log(
        `Flow created for ${targetId}. Children only get fileId and profile.`,
      );
    } catch (error) {
      this.logger.error(
        `uploadAndEditMultiple() | Failed: ${(error as Error).message}`,
      );
      throw new FileUploadFailedException();
    }
  }
}
