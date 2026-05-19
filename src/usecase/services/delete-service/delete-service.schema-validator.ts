import { z } from 'zod';

export const deleteServiceSchema = z.object({
  id: z.uuid(),
});
