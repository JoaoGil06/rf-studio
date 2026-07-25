import z from 'zod';

export const updateServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  category: z.enum(['nails', 'eyebrows']).optional(),
  price: z.number().nonnegative().optional(),
  durationMinutes: z.number().int().positive().optional(),
});
