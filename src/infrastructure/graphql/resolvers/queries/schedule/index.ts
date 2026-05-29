import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as scheduleQuery } from './schedule.query.js';
import { resolvers as schedulesQuery } from './schedules.query.js';
import { resolvers as schedulesInRangeQuery } from './schedulesInRange.query.js';

export const scheduleQueryResolvers = mergeResolvers([
  scheduleQuery,
  schedulesQuery,
  schedulesInRangeQuery,
]);
