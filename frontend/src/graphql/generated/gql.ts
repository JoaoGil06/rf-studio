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
    "\n  fragment ClientRowFields on User {\n    id\n    name\n    email\n    phoneNumber\n  }\n": typeof types.ClientRowFieldsFragmentDoc,
    "\n  fragment ProductDeleteFields on Product {\n    id\n    name\n  }\n": typeof types.ProductDeleteFieldsFragmentDoc,
    "\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      __typename\n      ... on DeleteProductSuccess {\n        id\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n": typeof types.DeleteProductDocument,
    "\n  fragment ProductEditFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n": typeof types.ProductEditFieldsFragmentDoc,
    "\n  mutation UpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      __typename\n      ... on UpdateProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n": typeof types.UpdateProductDocument,
    "\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n": typeof types.ProductCardFieldsFragmentDoc,
    "\n  fragment ServiceCardFields on Service {\n    id\n    name\n    category\n    price\n    durationMinutes\n  }\n": typeof types.ServiceCardFieldsFragmentDoc,
    "\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": typeof types.PingDocument,
    "\n  query Clients($first: Int, $after: String, $role: RoleName) {\n    users(first: $first, after: $after, role: $role) {\n      edges {\n        cursor\n        node {\n          id\n          ...ClientRowFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.ClientsDocument,
    "\n  mutation RegisterClient($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      __typename\n      ... on RegisterUserSuccess {\n        user {\n          id\n          ...ClientRowFields\n        }\n      }\n      ... on UserAlreadyExistsError {\n        message\n      }\n    }\n  }\n": typeof types.RegisterClientDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.ProductsDocument,
    "\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n": typeof types.RegisterProductDocument,
    "\n  query Services($first: Int, $after: String, $category: ServiceCategory) {\n    services(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ServiceCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.ServicesDocument,
    "\n  mutation RegisterService($input: RegisterServiceInput!) {\n    registerService(input: $input) {\n      __typename\n      ... on RegisterServiceSuccess {\n        service {\n          id\n          ...ServiceCardFields\n        }\n      }\n      ... on ServiceAlreadyExistsError {\n        message\n      }\n    }\n  }\n": typeof types.RegisterServiceDocument,
};
const documents: Documents = {
    "\n  fragment ClientRowFields on User {\n    id\n    name\n    email\n    phoneNumber\n  }\n": types.ClientRowFieldsFragmentDoc,
    "\n  fragment ProductDeleteFields on Product {\n    id\n    name\n  }\n": types.ProductDeleteFieldsFragmentDoc,
    "\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      __typename\n      ... on DeleteProductSuccess {\n        id\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n": types.DeleteProductDocument,
    "\n  fragment ProductEditFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n": types.ProductEditFieldsFragmentDoc,
    "\n  mutation UpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      __typename\n      ... on UpdateProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n": types.UpdateProductDocument,
    "\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n": types.ProductCardFieldsFragmentDoc,
    "\n  fragment ServiceCardFields on Service {\n    id\n    name\n    category\n    price\n    durationMinutes\n  }\n": types.ServiceCardFieldsFragmentDoc,
    "\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": types.PingDocument,
    "\n  query Clients($first: Int, $after: String, $role: RoleName) {\n    users(first: $first, after: $after, role: $role) {\n      edges {\n        cursor\n        node {\n          id\n          ...ClientRowFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.ClientsDocument,
    "\n  mutation RegisterClient($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      __typename\n      ... on RegisterUserSuccess {\n        user {\n          id\n          ...ClientRowFields\n        }\n      }\n      ... on UserAlreadyExistsError {\n        message\n      }\n    }\n  }\n": types.RegisterClientDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.ProductsDocument,
    "\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n": types.RegisterProductDocument,
    "\n  query Services($first: Int, $after: String, $category: ServiceCategory) {\n    services(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ServiceCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.ServicesDocument,
    "\n  mutation RegisterService($input: RegisterServiceInput!) {\n    registerService(input: $input) {\n      __typename\n      ... on RegisterServiceSuccess {\n        service {\n          id\n          ...ServiceCardFields\n        }\n      }\n      ... on ServiceAlreadyExistsError {\n        message\n      }\n    }\n  }\n": types.RegisterServiceDocument,
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
export function graphql(source: "\n  fragment ClientRowFields on User {\n    id\n    name\n    email\n    phoneNumber\n  }\n"): (typeof documents)["\n  fragment ClientRowFields on User {\n    id\n    name\n    email\n    phoneNumber\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductDeleteFields on Product {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment ProductDeleteFields on Product {\n    id\n    name\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      __typename\n      ... on DeleteProductSuccess {\n        id\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteProduct($input: DeleteProductInput!) {\n    deleteProduct(input: $input) {\n      __typename\n      ... on DeleteProductSuccess {\n        id\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductEditFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n"): (typeof documents)["\n  fragment ProductEditFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      __typename\n      ... on UpdateProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProduct($input: UpdateProductInput!) {\n    updateProduct(input: $input) {\n      __typename\n      ... on UpdateProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n      ... on ProductNotFoundError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n"): (typeof documents)["\n  fragment ProductCardFields on Product {\n    id\n    name\n    brand\n    category\n    color\n    isAvailable\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ServiceCardFields on Service {\n    id\n    name\n    category\n    price\n    durationMinutes\n  }\n"): (typeof documents)["\n  fragment ServiceCardFields on Service {\n    id\n    name\n    category\n    price\n    durationMinutes\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query Ping {\n    users(first: 1) {\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Clients($first: Int, $after: String, $role: RoleName) {\n    users(first: $first, after: $after, role: $role) {\n      edges {\n        cursor\n        node {\n          id\n          ...ClientRowFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query Clients($first: Int, $after: String, $role: RoleName) {\n    users(first: $first, after: $after, role: $role) {\n      edges {\n        cursor\n        node {\n          id\n          ...ClientRowFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterClient($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      __typename\n      ... on RegisterUserSuccess {\n        user {\n          id\n          ...ClientRowFields\n        }\n      }\n      ... on UserAlreadyExistsError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterClient($input: RegisterUserInput!) {\n    registerUser(input: $input) {\n      __typename\n      ... on RegisterUserSuccess {\n        user {\n          id\n          ...ClientRowFields\n        }\n      }\n      ... on UserAlreadyExistsError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      __typename\n      ... on LoginSuccess {\n        token\n        user {\n          id\n          name\n          email\n          role {\n            name\n          }\n        }\n      }\n      ... on InvalidCredentialsError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query Products($first: Int, $after: String, $category: String) {\n    products(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ProductCardFields\n          ...ProductEditFields\n          ...ProductDeleteFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterProduct($input: RegisterProductInput!) {\n    registerProduct(input: $input) {\n      __typename\n      ... on RegisterProductSuccess {\n        product {\n          id\n          ...ProductCardFields\n        }\n      }\n      ... on ProductAlreadyExistsError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Services($first: Int, $after: String, $category: ServiceCategory) {\n    services(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ServiceCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query Services($first: Int, $after: String, $category: ServiceCategory) {\n    services(first: $first, after: $after, category: $category) {\n      edges {\n        cursor\n        node {\n          id\n          ...ServiceCardFields\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterService($input: RegisterServiceInput!) {\n    registerService(input: $input) {\n      __typename\n      ... on RegisterServiceSuccess {\n        service {\n          id\n          ...ServiceCardFields\n        }\n      }\n      ... on ServiceAlreadyExistsError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterService($input: RegisterServiceInput!) {\n    registerService(input: $input) {\n      __typename\n      ... on RegisterServiceSuccess {\n        service {\n          id\n          ...ServiceCardFields\n        }\n      }\n      ... on ServiceAlreadyExistsError {\n        message\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;