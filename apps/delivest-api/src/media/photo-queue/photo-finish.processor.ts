import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ParentPhotoQueuePayload } from '../interface/photo-payload.interface.js';
import { ChildResult } from '../interface/photo-editor-result.interface.js';

@Processor('photo-notifications')
export class PhotoFinishProcessor extends WorkerHost {
  constructor(private eventEmitter: EventEmitter2) {
    super();
  }

  async process(job: Job<ParentPhotoQueuePayload>) {
    const { targetId, socketId, succesEventType, failEventType } = job.data;

    const childrenValues = await job.getChildrenValues<ChildResult>();
    const photosBatch: Record<string, string> = {};

    for (const res of Object.values(childrenValues)) {
      if (res && res.success && res.fileId) {
        photosBatch[res.key] = res.fileId;
      }
    }

    const isSuccess = Object.keys(photosBatch).length > 0;

    if (isSuccess) {
      this.eventEmitter.emit(succesEventType, {
        targetId,
        socketId,
        photos: photosBatch,
      });

      return { status: 'success' };
    } else {
      this.eventEmitter.emit(failEventType, {
        targetId,
        socketId,
        message: 'All photo processing tasks failed or returned empty results',
      });

      return { status: 'failed' };
    }
  }
}
