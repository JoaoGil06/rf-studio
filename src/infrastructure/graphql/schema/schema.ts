import { errorTypeDefs } from './typedefs/error.graphql.js';
import { serviceTypeDefs } from './typedefs/service.graphql.js';
import { userTypeDefs } from './typedefs/user.graphql.js';

export const typeDefs = [errorTypeDefs, userTypeDefs, serviceTypeDefs];
