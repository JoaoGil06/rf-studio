export const userTypeDefs = `#graphql
    type User {
        id: ID!
        name: String!
        email: String!
        phoneNumber: String!
        birthDate: String
        createdAt: String!
    }

    input RegisterUserInput {
        name: String!
        email: String!
        password: String!
        phoneNumber: String!
        birthDate: String
    }

    type RegisterUserSuccess {
        user: User!
    }

    union RegisterUserPayload = RegisterUserSuccess | UserAlreadyExistsError

    type Query {
        _empty: String
    }

    type Mutation {
        registerUser(input: RegisterUserInput!): RegisterUserPayload!
    }
`;
