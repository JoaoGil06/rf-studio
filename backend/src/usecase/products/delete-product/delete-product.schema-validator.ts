import { z } from 'zod';

export const deleteProductSchema = z.object({
  id: z.uuid(),
});
