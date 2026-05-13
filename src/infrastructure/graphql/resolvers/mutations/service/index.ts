import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerService } from './registerService.mutation.js';

export const serviceMutationResolvers = mergeResolvers([registerService]);
