import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

type GraphQLScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface UpdateScheduleArgs {
  input: {
    id: string;
    status?: GraphQLScheduleStatus;
    date?: string | null;
    serviceId?: string | null;
  };
}

const SCHEDULE_NOT_FOUND_KIND = '__scheduleNotFound';
const SERVICE_NOT_FOUND_KIND = '__serviceNotFound';
const CONFLICT_KIND = '__conflict';

export const resolvers = {
  UpdateSchedulePayload: {
    __resolveType(obj: Record<string, unknown>) {
      if ('schedule' in obj) return 'UpdateScheduleSuccess';
      if (SCHEDULE_NOT_FOUND_KIND in obj) return 'ScheduleNotFoundError';
      if (SERVICE_NOT_FOUND_KIND in obj) return 'ServiceNotFoundError';
      if (CONFLICT_KIND in obj) return 'ScheduleAlreadyBookedError';
      return null;
    },
  },
  Mutation: {
    updateSchedule: async (_: unknown, { input }: UpdateScheduleArgs, context: AppContext) => {
      try {
        const dto = await context.useCases.updateSchedule.execute({
          id: input.id,
          status: input.status,
          date: input.date ? new Date(input.date) : undefined,
          serviceId: input.serviceId ?? undefined,
        });

        return {
          schedule: {
            id: dto.id,
            userId: dto.userId,
            serviceId: dto.serviceId,
            status: dto.status,
            date: dto.date,
            photoUrl: dto.photoUrl,
            createdAt: dto.createdAt,
          },
        };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          if (error.message.startsWith('Schedule not found')) {
            return { [SCHEDULE_NOT_FOUND_KIND]: true, message: error.message };
          }
          if (error.message.startsWith('Service not found')) {
            return { [SERVICE_NOT_FOUND_KIND]: true, message: error.message };
          }
        }
        if (error instanceof ConflictError) {
          return { [CONFLICT_KIND]: true, message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};
