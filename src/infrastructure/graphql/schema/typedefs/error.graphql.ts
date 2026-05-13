export const errorTypeDefs = `#graphql
  # Auth
  type InvalidCredentialsError {
    message: String!
  }

  # Users
  type UserAlreadyExistsError {
    message: String!
  }

  type UserNotFoundError {
    message: String!
  }

  # Services
  type ServiceAlreadyExistsError {
    message: String!
  }
`;
