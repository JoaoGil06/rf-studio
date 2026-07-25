import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { mergeResolvers } from '@graphql-tools/merge';
import { queryResolvers } from './queries/index.js';
import { mutationResolvers } from './mutations/index.js';
import { fieldResolvers } from './field_resolvers/index.js';

export const resolvers = mergeResolvers([
  queryResolvers,
  mutationResolvers,
  fieldResolvers,
  { Upload: GraphQLUpload },
]);
