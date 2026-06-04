import z from 'zod';

export const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  isAvailable: z.boolean().optional(),
});
