export const productTypeDefs = `#graphql
    type Query {
        product(id: ID!): Product!
        products(first: Int, after: String, category: String): ProductConnection!
    }

    type Mutation {
        registerProduct(input: RegisterProductInput!): RegisterProductPayload!
        updateProduct(input: UpdateProductInput!): UpdateProductPayload!
        deleteProduct(input: DeleteProductInput!): DeleteProductPayload!
    }

    type Product {
        id: ID!
        name: String!
        brand: String!
        category: String!
        color: String
        isAvailable: Boolean!
        createdAt: String!
    }

    input RegisterProductInput {
        name: String!
        brand: String!
        category: String!
        color: String
        isAvailable: Boolean
    }

    type ProductEdge {
        node: Product!
        cursor: String!
    }

    type ProductConnection {
        edges: [ProductEdge!]!
        pageInfo: PageInfo!
    }

    type RegisterProductSuccess {
        product: Product!
    }

    union RegisterProductPayload = RegisterProductSuccess | ProductAlreadyExistsError

    input UpdateProductInput {
        id: ID!
        name: String
        brand: String
        category: String
        color: String
        isAvailable: Boolean
    }

    type UpdateProductSuccess {
        product: Product!
    }

    union UpdateProductPayload = UpdateProductSuccess | ProductNotFoundError | ProductAlreadyExistsError

    input DeleteProductInput {
        id: ID!
    }

    type DeleteProductSuccess {
        id: ID!
    }

    union DeleteProductPayload = DeleteProductSuccess | ProductNotFoundError
`;
