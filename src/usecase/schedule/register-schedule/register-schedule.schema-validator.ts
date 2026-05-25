import { z } from 'zod';

export const registerScheduleSchema = z.object({
  userId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.date(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  photoUrl: z.string().url().max(500).nullish(),
});
