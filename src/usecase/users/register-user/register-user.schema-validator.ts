import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(9),
  birthDate: z.string().nullable().optional(),
});
