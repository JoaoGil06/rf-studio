import { z } from 'zod';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export const getSchedulesInRangeSchema = z.object({
  filter: z
    .object({
      userId: z.string().uuid().nullish(),
      year: z.number().int().min(MIN_YEAR).max(MAX_YEAR).nullish(),
      month: z.number().int().min(1).max(12).nullish(),
      weekStart: z.coerce.date().nullish(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    })
    .refine(
      (f) => {
        const hasWeek = f.weekStart != null;
        const hasYear = f.year != null;
        const hasMonth = f.month != null;

        if (hasWeek && (hasYear || hasMonth)) return false;
        if (hasMonth && !hasYear) return false;
        if (!hasWeek && !hasYear) return false;

        return true;
      },
      {
        message:
          'Provide exactly one of: { weekStart }, { year, month }, or { year } (userId is optional and can combine with any mode).',
      },
    ),
});
