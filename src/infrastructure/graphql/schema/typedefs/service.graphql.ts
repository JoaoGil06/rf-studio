export const serviceTypeDefs = `#graphql
    type Query {
        _serviceRoot: String
    }

    type Mutation {
        registerService(input: RegisterServiceInput!): RegisterServicePayload!
    }

    enum ServiceCategory {
        nails
        eyebrows
    }

    type Service {
        id: ID!
        name: String!
        category: ServiceCategory!
        price: Float!
        durationMinutes: Int!
        createdAt: String!
    }

    input RegisterServiceInput {
        name: String!
        category: ServiceCategory!
        price: Float!
        durationMinutes: Int!
    }

    type RegisterServiceSuccess {
        service: Service!
    }

    union RegisterServicePayload = RegisterServiceSuccess | ServiceAlreadyExistsError
`;
