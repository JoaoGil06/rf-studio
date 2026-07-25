import { z } from 'zod';

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phoneNumber: z.string().min(9).optional(),
  birthDate: z.string().nullable().optional(),
});
