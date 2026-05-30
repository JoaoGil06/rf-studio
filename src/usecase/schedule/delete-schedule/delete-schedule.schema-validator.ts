import { z } from 'zod';

export const deleteScheduleSchema = z.object({
  id: z.uuid(),
});
