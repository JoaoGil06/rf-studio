export const userTypeDefs = `#graphql
    type Query {
        users(first: Int, after: String): UserConnection! 
        user(id: ID!): User! 
    }

    type Mutation {
        registerUser(input: RegisterUserInput!): RegisterUserPayload!
    }

     type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }

    type Role {
        id: ID!
        name: String!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        phoneNumber: String!
        role: Role!
        birthDate: String
        createdAt: String!
    }

    type UserEdge {
        node: User!
        cursor: String!
    }

    type UserConnection {
        edges: [UserEdge!]!
        pageInfo: PageInfo!
    }
    # Não é necessário Role aqui porque criamos sempre com "Cliente" por default 
    # Conseguimos ver isto no register-user useCase
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
    
  
`;
