/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n": typeof types.ProductCardFieldsFragmentDoc,
    "\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": typeof types.PingDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.ProductsDocument,
    "\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n": typeof types.RegisterProductDocument,
};
const documents: Documents = {
    "\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n": types.ProductCardFieldsFragmentDoc,
    "\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": types.PingDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.ProductsDocument,
    "\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n": types.RegisterProductDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n"): (typeof documents)["\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;