import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

type GraphQLScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type DomainScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface RegisterScheduleArgs {
  input: {
    userId: string;
    serviceId: string;
    date: string;
    status?: GraphQLScheduleStatus;
    photoUrl?: string | null;
  };
}

const USER_NOT_FOUND_KIND = '__userNotFound';
const SERVICE_NOT_FOUND_KIND = '__serviceNotFound';
const CONFLICT_KIND = '__conflict';

export const resolvers = {
  RegisterSchedulePayload: {
    __resolveType(obj: Record<string, unknown>) {
      if ('schedule' in obj) return 'RegisterScheduleSuccess';
      if (USER_NOT_FOUND_KIND in obj) return 'UserNotFoundError';
      if (SERVICE_NOT_FOUND_KIND in obj) return 'ServiceNotFoundError';
      if (CONFLICT_KIND in obj) return 'ScheduleAlreadyBookedError';
      return null;
    },
  },
  Mutation: {
    registerSchedule: async (_: unknown, { input }: RegisterScheduleArgs, context: AppContext) => {
      try {
        const dto = await context.useCases.registerSchedule.execute({
          userId: input.userId,
          serviceId: input.serviceId,
          date: new Date(input.date),
          status: input.status,
          photoUrl: input.photoUrl ?? null,
        });

        return {
          schedule: {
            id: dto.id,
            userId: dto.userId,
            serviceId: dto.serviceId,
            status: dto.status as DomainScheduleStatus,
            date: dto.date,
            photoUrl: dto.photoUrl,
            createdAt: dto.createdAt,
          },
        };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          if (error.message.startsWith('User not found')) {
            return { [USER_NOT_FOUND_KIND]: true, message: error.message };
          }
          if (error.message.startsWith('Service not found')) {
            return { [SERVICE_NOT_FOUND_KIND]: true, message: error.message };
          }
        }
        if (error instanceof ConflictError) {
          return { [CONFLICT_KIND]: true, message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw error;
      }
    },
  },
};
