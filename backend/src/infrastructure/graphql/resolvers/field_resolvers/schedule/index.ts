import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';
import { resolvers as scheduleFields } from './schedule.field.js';

export const scheduleTypeResolvers: IResolvers = mergeResolvers([scheduleFields]);
