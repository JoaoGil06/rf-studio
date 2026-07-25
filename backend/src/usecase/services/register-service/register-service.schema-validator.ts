import { z } from 'zod';

export const registerServiceSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['nails', 'eyebrows']),
  price: z.number().nonnegative(),
  durationMinutes: z.number().int().positive(),
});
