import { errorTypeDefs } from './typedefs/error.graphql.js';
import { paginationTypeDefs } from './typedefs/pagination.graphql.js';
import { scheduleTypeDefs } from './typedefs/schedule.graphql.js';
import { serviceTypeDefs } from './typedefs/service.graphql.js';
import { uploadTypeDefs } from './typedefs/upload.graphql.js';
import { userTypeDefs } from './typedefs/user.graphql.js';

export const typeDefs = [
  uploadTypeDefs,
  errorTypeDefs,
  paginationTypeDefs,
  userTypeDefs,
  serviceTypeDefs,
  scheduleTypeDefs,
];
