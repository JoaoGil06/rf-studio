export const serviceTypeDefs = `#graphql
    type Query {
        service(id: ID!): Service!
        services(first: Int, after: String, category: ServiceCategory): ServiceConnection!
    }

    type Mutation {
        registerService(input: RegisterServiceInput!): RegisterServicePayload!
        updateService(input: UpdateServiceInput!): UpdateServicePayload!
        deleteService(input: DeleteServiceInput!): DeleteServicePayload!
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

    type ServiceEdge {
        node: Service!
        cursor: String!
    }

    type ServiceConnection {
        edges: [ServiceEdge!]!
        pageInfo: PageInfo!
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

    input UpdateServiceInput {
        id: ID!
        name: String
        category: ServiceCategory
        price: Float
        durationMinutes: Int
    }

    type UpdateServiceSuccess {
        service: Service!
    }

    union UpdateServicePayload = UpdateServiceSuccess | ServiceNotFoundError | ServiceAlreadyExistsError

    input DeleteServiceInput {
        id: ID!
    }

    type DeleteServiceSuccess {
        id: ID!
    }

    union DeleteServicePayload = DeleteServiceSuccess | ServiceNotFoundError
`;
