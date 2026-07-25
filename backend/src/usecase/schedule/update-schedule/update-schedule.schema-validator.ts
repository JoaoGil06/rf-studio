import { z } from 'zod';

export const updateScheduleSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).optional(),
  date: z.coerce.date().optional(),
  serviceId: z.string().uuid().optional(),
  photoUrl: z.string().url().max(500).nullish(),
});
