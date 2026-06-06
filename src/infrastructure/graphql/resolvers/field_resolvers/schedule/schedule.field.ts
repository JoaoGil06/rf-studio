import { GraphQLError } from 'graphql';
import type { AppContext } from '../../../context.types.js';
import type { ScheduleNodeDto } from '../../../../../usecase/schedule/get-schedule/get-schedule.dto.js';

const STATUS_TO_GRAPHQL: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const resolvers = {
  Schedule: {
    status: (parent: ScheduleNodeDto) => STATUS_TO_GRAPHQL[parent.status] ?? parent.status,
    user: async (parent: ScheduleNodeDto, _: unknown, context: AppContext) => {
      const user = await context.dataLoaders.user.load(parent.userId);
      if (!user) {
        throw new GraphQLError(`User not found: ${parent.userId}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return user;
    },

    service: async (parent: ScheduleNodeDto, _: unknown, context: AppContext) => {
      const service = await context.dataLoaders.service.load(parent.serviceId);
      if (!service) {
        throw new GraphQLError(`Service not found: ${parent.serviceId}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return service;
    },
    products: (parent: ScheduleNodeDto, _: unknown, context: AppContext) =>
      context.dataLoaders.scheduleProducts.load(parent.id),
  },
};
