import sharp from 'sharp';
import { PhotoEvent } from '../../shared/events/types.js';

export enum PhotoConvertFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  HEIF = 'heif',
  GIF = 'gif',
  TIFF = 'tiff',
}

export type SharpPosition =
  | 'centre'
  | 'center'
  | 'top'
  | 'right top'
  | 'right'
  | 'right bottom'
  | 'bottom'
  | 'left bottom'
  | 'left'
  | 'left top'
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'entropy'
  | 'attention';

export interface PhotoProfile {
  format?: PhotoConvertFormat;
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: SharpPosition;
  quality?: number;
  background?: string | sharp.RGBA;
}

export interface PhotoQueuePayload {
  fileId: string;
  profile: PhotoProfile;
  socketId: string;
  eventType: PhotoEvent;
}
