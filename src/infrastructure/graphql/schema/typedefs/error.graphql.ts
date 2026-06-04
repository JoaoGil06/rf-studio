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

  type ServiceNotFoundError {
    message: String!
  }

  # Schedules
  type ScheduleNotFoundError {
    message: String!
  }

  # Products
  type ProductAlreadyExistsError {
    message: String!
  }

  type ProductNotFoundError {
    message: String!
  }
`;
