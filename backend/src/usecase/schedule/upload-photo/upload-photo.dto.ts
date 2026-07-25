export interface UploadPhotoInputDto {
  buffer: Buffer;
  filename: string;
  mimetype: string;
}

export interface UploadPhotoOutputDto {
  url: string;
}
