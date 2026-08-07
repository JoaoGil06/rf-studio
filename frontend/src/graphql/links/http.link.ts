import { HttpLink } from '@apollo/client';
import { GRAPHQL_ENDPOINT } from '../../constants/env';

export const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });
