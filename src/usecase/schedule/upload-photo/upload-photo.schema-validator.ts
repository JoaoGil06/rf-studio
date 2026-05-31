import { z } from 'zod';

export const uploadPhotoSchema = z.object({
  filename: z.string().min(1),
});
