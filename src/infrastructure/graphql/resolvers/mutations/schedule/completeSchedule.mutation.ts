import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface CompleteScheduleArgs {
  input: { scheduleId: string; productIds: string[] };
}

const SCHEDULE_NOT_FOUND_KIND = '__scheduleNotFound';
const SERVICE_NOT_FOUND_KIND = '__serviceNotFound';
const PRODUCT_NOT_FOUND_KIND = '__productNotFound';
const NOT_COMPLETABLE_KIND = '__notCompletable';

export const resolvers = {
  CompleteSchedulePayload: {
    __resolveType(obj: Record<string, unknown>) {
      if ('schedule' in obj) return 'CompleteScheduleSuccess';
      if (SCHEDULE_NOT_FOUND_KIND in obj) return 'ScheduleNotFoundError';
      if (SERVICE_NOT_FOUND_KIND in obj) return 'ServiceNotFoundError';
      if (PRODUCT_NOT_FOUND_KIND in obj) return 'ProductNotFoundError';
      if (NOT_COMPLETABLE_KIND in obj) return 'ScheduleNotCompletableError';
      return null;
    },
  },
  Mutation: {
    completeSchedule: async (_: unknown, { input }: CompleteScheduleArgs, context: AppContext) => {
      try {
        const dto = await context.useCases.completeSchedule.execute({
          scheduleId: input.scheduleId,
          productIds: input.productIds,
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
          if (error.message.startsWith('Product not found')) {
            return { [PRODUCT_NOT_FOUND_KIND]: true, message: error.message };
          }
        }
        if (error instanceof ConflictError) {
          return { [NOT_COMPLETABLE_KIND]: true, message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};
