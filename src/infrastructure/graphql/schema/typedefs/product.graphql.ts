export const productTypeDefs = `#graphql
    type Query {
        product(id: ID!): Product!
        products(first: Int, after: String): ProductConnection!
    }

    type Mutation {
        registerProduct(input: RegisterProductInput!): RegisterProductPayload!
    }

    type Product {
        id: ID!
        name: String!
        brand: String!
        color: String
        isAvailable: Boolean!
        createdAt: String!
    }

    input RegisterProductInput {
        name: String!
        brand: String!
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
`;