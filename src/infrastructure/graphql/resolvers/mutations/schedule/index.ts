import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerSchedule } from './registerSchedule.mutation.js';

export const scheduleMutationResolvers = mergeResolvers([registerSchedule]);
