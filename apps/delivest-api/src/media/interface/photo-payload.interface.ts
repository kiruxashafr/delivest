import { PhotoEvent } from '../../shared/events/types.js';
import { PhotoProfile } from '../photo-configs/profiles.js';

export interface ParentPhotoQueuePayload {
  targetId: string;
  socketId: string;
  succesEventType: PhotoEvent;
  failEventType: PhotoEvent;
}

export interface ChildPhotoQueuePayload {
  targetId: string;
  fileId: string;
  profile: PhotoProfile;
  profileKey: string;
}

export interface PhotoQueuePayload {
  targetId: string;
  fileId: string;
  profile: PhotoProfile;
  profileKey: string;
  socketId: string;
  eventType: PhotoEvent;
  failEventType: PhotoEvent;
}
