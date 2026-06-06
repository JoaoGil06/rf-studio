import { z } from 'zod';

export const completeScheduleSchema = z.object({
  scheduleId: z.string().uuid(),
  productIds: z.array(z.string().uuid()).min(1),
});
