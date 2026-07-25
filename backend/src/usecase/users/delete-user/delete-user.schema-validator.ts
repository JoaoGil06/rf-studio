import { z } from 'zod';

export const deleteUserSchema = z.object({
  id: z.uuid(),
});
