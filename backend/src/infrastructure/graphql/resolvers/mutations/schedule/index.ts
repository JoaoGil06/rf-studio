import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerSchedule } from './registerSchedule.mutation.js';
import { resolvers as updateSchedule } from './updateSchedule.mutation.js';
import { resolvers as deleteSchedule } from './deleteSchedule.mutation.js';
import { resolvers as completeSchedule } from './completeSchedule.mutation.js';

export const scheduleMutationResolvers = mergeResolvers([
  registerSchedule,
  updateSchedule,
  deleteSchedule,
  completeSchedule,
]);
