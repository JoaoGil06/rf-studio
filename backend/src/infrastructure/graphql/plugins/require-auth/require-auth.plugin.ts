import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import type { AppContext } from '../../context.types.js';
import { GraphQLError } from 'graphql';
import type { FieldNode, OperationDefinitionNode } from 'graphql';
import { PUBLIC_OPERATIONS } from '../public-operations.js';

function topLevelFieldNames(operation: OperationDefinitionNode): string[] {
  return operation.selectionSet.selections
    .filter((selection): selection is FieldNode => selection.kind === 'Field')
    .map((field) => field.name.value);
}

function requiresAuth(operation: OperationDefinitionNode): boolean {
  return topLevelFieldNames(operation).some((name) => !PUBLIC_OPERATIONS.has(name));
}

export function requireAuthPlugin(): ApolloServerPlugin<AppContext> {
  return {
    async requestDidStart(): Promise<GraphQLRequestListener<AppContext>> {
      return {
        async didResolveOperation({ operation, contextValue }) {
          if (!operation) return;
          if (!requiresAuth(operation)) return;
          if (contextValue.currentUser) return;

          throw new GraphQLError('You must be authenticated to perform this operation', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        },
      };
    },
  };
}
