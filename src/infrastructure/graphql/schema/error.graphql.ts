export const errorTypeDefs = `#graphql
  type UserAlreadyExistsError {
    message: String
  }

  type InvalidCredentialsError {
    message: String!
  }
`;
