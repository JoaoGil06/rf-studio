import { z } from 'zod';

export const registerProductSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  color: z.string().min(1).nullish(),
  isAvailable: z.boolean().optional(),
});