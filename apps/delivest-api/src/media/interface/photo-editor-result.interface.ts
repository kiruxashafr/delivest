export interface PhotoEditResult {
  newFileId: string;
}

export interface ChildResult {
  key: string;
  fileId: string;
  success: boolean;
}

export interface PhotoBatchPayload {
  targetId: string;
  socketId: string;
  photos: Record<string, string>;
}
