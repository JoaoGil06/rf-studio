export const productTypeDefs = `#graphql
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

    type RegisterProductSuccess {
        product: Product!
    }

    union RegisterProductPayload = RegisterProductSuccess | ProductAlreadyExistsError
`;