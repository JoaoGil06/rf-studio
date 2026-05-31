export interface UploadParams {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface IStorageAdapter {
  upload(params: UploadParams): Promise<{ url: string }>;
  delete(url: string): Promise<void>;
}
