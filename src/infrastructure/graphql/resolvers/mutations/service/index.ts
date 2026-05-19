import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerService } from './registerService.mutation.js';
import { resolvers as updateService } from './updateService.mutation.js';

export const serviceMutationResolvers = mergeResolvers([registerService, updateService]);
