import { PhotoProfile } from '../../media/interface/photo-payload.interface.js';

export enum PhotoConvertFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
}

export const PHOTO_PROFILES = {
  PRODUCT_CARD: {
    format: PhotoConvertFormat.WEBP,
    width: 600,
    height: 480,
    fit: 'contain' as const,
    position: 'centre',
    quality: 90,
    background: '#FFFFFF',
  },
} as const satisfies Record<string, PhotoProfile>;
