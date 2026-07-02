// src/main.ts
import "dotenv/config";

// src/infrastructure/api/config/server.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import cors from "cors";
import express from "express";

// src/infrastructure/graphql/schema/typedefs/error.graphql.ts
var errorTypeDefs = `#graphql
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

   type ScheduleNotCompletableError {
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

// src/infrastructure/graphql/schema/typedefs/pagination.graphql.ts
var paginationTypeDefs = `#graphql
    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }
`;

// src/infrastructure/graphql/schema/typedefs/product.graphql.ts
var productTypeDefs = `#graphql
    type Query {
        product(id: ID!): Product!
        products(first: Int, after: String): ProductConnection!
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

// src/infrastructure/graphql/schema/typedefs/schedule.graphql.ts
var scheduleTypeDefs = `#graphql
    type Query {
       schedule(id: ID!): Schedule!
       schedules(filter: SchedulesFilter, first: Int, after: String): ScheduleConnection!
       schedulesInRange(filter: SchedulesRangeFilter!): [Schedule!]!
    }

    type Mutation {
        registerSchedule(input: RegisterScheduleInput!): RegisterSchedulePayload!
        updateSchedule(input: UpdateScheduleInput!): UpdateSchedulePayload!
        deleteSchedule(input: DeleteScheduleInput!): DeleteSchedulePayload!
        completeSchedule(input: CompleteScheduleInput!): CompleteSchedulePayload!
    }

    enum ScheduleStatus {
        pending
        confirmed
        completed
        cancelled
    }
    
    type ScheduleDiscount {
        reason: String!
        percentage: Float!
    }

    type Schedule {
        id: ID!
        userId: ID!
        serviceId: ID!
        status: ScheduleStatus!
        date: String!
        photoUrl: String
        tip: Float
        createdAt: String!
        user: User!
        service: Service!
        products: [Product!]!
        discount: ScheduleDiscount
        finalPrice: Float!
    }

    type ScheduleEdge {
        node: Schedule!
        cursor: String!
    }

    type ScheduleConnection {
        edges: [ScheduleEdge!]!
        pageInfo: PageInfo!
    }

    input SchedulesFilter {
        userId: ID
        status: ScheduleStatus
    }

    input SchedulesRangeFilter {
        user: ID
        year: Int
        month: Int
        weekStart: String
        status: ScheduleStatus
    }

    input RegisterScheduleInput {
        userId: ID!
        serviceId: ID!
        date: String!
        status: ScheduleStatus
        photoUrl: Upload
    }

     input UpdateScheduleInput {
        id: ID!
        status: ScheduleStatus
        date: String
        serviceId: ID
        photo: Upload
    }

    input CompleteScheduleInput {
        scheduleId: ID!
        productIds: [ID!]!
    }

    type UpdateScheduleSuccess {
        schedule: Schedule!
    }

    type ScheduleAlreadyBookedError {
        message: String!
    }

    type RegisterScheduleSuccess {
        schedule: Schedule!
    }

    type CompleteScheduleSuccess {
        schedule: Schedule!
    }

    union RegisterSchedulePayload =
          RegisterScheduleSuccess
        | UserNotFoundError
        | ServiceNotFoundError
        | ScheduleAlreadyBookedError

    union UpdateSchedulePayload =
        UpdateScheduleSuccess
        | ScheduleNotFoundError
        | ServiceNotFoundError
        | ScheduleAlreadyBookedError
    
    union CompleteSchedulePayload =
          CompleteScheduleSuccess
        | ScheduleNotFoundError
        | ServiceNotFoundError
        | ProductNotFoundError
        | ScheduleNotCompletableError

    input DeleteScheduleInput {
        id: ID!
    }

    type DeleteScheduleSuccess {
        id: ID!
    }

    union DeleteSchedulePayload = DeleteScheduleSuccess | ScheduleNotFoundError
`;

// src/infrastructure/graphql/schema/typedefs/service.graphql.ts
var serviceTypeDefs = `#graphql
    type Query {
        service(id: ID!): Service!
        services(first: Int, after: String): ServiceConnection!
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

// src/infrastructure/graphql/schema/typedefs/upload.graphql.ts
var uploadTypeDefs = `#graphql
    scalar Upload
`;

// src/infrastructure/graphql/schema/typedefs/user.graphql.ts
var userTypeDefs = `#graphql
    type Query {
        users(first: Int, after: String): UserConnection! 
        user(id: ID!): User! 
    }

    type Mutation {
        registerUser(input: RegisterUserInput!): RegisterUserPayload!
        login(input: LoginInput!): LoginPayload!
        logout: LogoutSuccess!
        updateUser(input: UpdateUserInput!): UpdateUserPayload!
        deleteUser(input: DeleteUserInput!): DeleteUserPayload!
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

    # N\xE3o \xE9 necess\xE1rio Role aqui porque criamos sempre com "Cliente" por default 
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
    
    input LoginInput {
        email: String!
        password: String!
    }

    type LoginSuccess {
        token: String!
        user: User!
    }

    union LoginPayload = LoginSuccess | InvalidCredentialsError

    type LogoutSuccess {
        success: Boolean!
    }

    input UpdateUserInput {
        id: ID!
        name: String
        email: String
        phoneNumber: String
        birthDate: String
    }

    type UpdateUserSuccess {
        user: User!
    }

    union UpdateUserPayload = UpdateUserSuccess | UserNotFoundError | UserAlreadyExistsError

    input DeleteUserInput {
        id: ID!
    }

    type DeleteUserSuccess {
        id: ID!
    }

    union DeleteUserPayload = DeleteUserSuccess | UserNotFoundError

`;

// src/infrastructure/graphql/schema/schema.ts
var typeDefs = [
  uploadTypeDefs,
  errorTypeDefs,
  paginationTypeDefs,
  userTypeDefs,
  serviceTypeDefs,
  scheduleTypeDefs,
  productTypeDefs
];

// src/infrastructure/graphql/resolvers/index.ts
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import { mergeResolvers as mergeResolvers15 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/index.ts
import { mergeResolvers as mergeResolvers5 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/user/index.ts
import { mergeResolvers } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/user/users.query.ts
var resolvers = {
  Query: {
    users: async (_, args, context) => {
      return context.useCases.getUsers.execute(args);
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/user/user.query.ts
var resolvers2 = {
  Query: {
    user: async (_, args, context) => {
      return context.useCases.getUser.execute(args);
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/user/index.ts
var userQueryResolvers = mergeResolvers([resolvers, resolvers2]);

// src/infrastructure/graphql/resolvers/queries/service/index.ts
import { mergeResolvers as mergeResolvers2 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/service/service.query.ts
import { GraphQLError } from "graphql";

// src/domain/@shared/errors/entityNotFoundError.ts
var EntityNotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "EntityNotFoundError";
  }
};

// src/infrastructure/graphql/resolvers/queries/service/service.query.ts
var resolvers3 = {
  Query: {
    service: async (_, args, context) => {
      try {
        return await context.useCases.getService.execute(args);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new GraphQLError(error.message, { extensions: { code: "NOT_FOUND" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/service/services.query.ts
import { GraphQLError as GraphQLError2 } from "graphql";

// src/domain/@shared/errors/invalidValueError.ts
var InvalidValueError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidValueError";
  }
};

// src/infrastructure/graphql/resolvers/queries/service/services.query.ts
var resolvers4 = {
  Query: {
    services: async (_, args, context) => {
      try {
        return await context.useCases.getServices.execute(args);
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError2(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/service/index.ts
var serviceQueryResolvers = mergeResolvers2([resolvers3, resolvers4]);

// src/infrastructure/graphql/resolvers/queries/schedule/index.ts
import { mergeResolvers as mergeResolvers3 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/schedule/schedule.query.ts
import { GraphQLError as GraphQLError3 } from "graphql";
var resolvers5 = {
  Query: {
    schedule: async (_, args, context) => {
      try {
        return await context.useCases.getSchedule.execute(args);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new GraphQLError3(error.message, { extensions: { code: "NOT_FOUND" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/schedule/schedules.query.ts
import { GraphQLError as GraphQLError4 } from "graphql";
var resolvers6 = {
  Query: {
    schedules: async (_, args, context) => {
      try {
        return await context.useCases.getSchedules.execute(args);
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError4(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/schedule/schedulesInRange.query.ts
import { GraphQLError as GraphQLError5 } from "graphql";
var resolvers7 = {
  Query: {
    schedulesInRange: async (_, args, context) => {
      try {
        return await context.useCases.getSchedulesInRange.execute({
          filter: {
            userId: args.filter.userId,
            year: args.filter.year,
            month: args.filter.month,
            weekStart: args.filter.weekStart ? new Date(args.filter.weekStart) : null,
            status: args.filter.status
          }
        });
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError5(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/schedule/index.ts
var scheduleQueryResolvers = mergeResolvers3([
  resolvers5,
  resolvers6,
  resolvers7
]);

// src/infrastructure/graphql/resolvers/queries/product/index.ts
import { mergeResolvers as mergeResolvers4 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/product/product.query.ts
import { GraphQLError as GraphQLError6 } from "graphql";
var resolvers8 = {
  Query: {
    product: async (_, args, context) => {
      try {
        return await context.useCases.getProduct.execute(args);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new GraphQLError6(error.message, { extensions: { code: "NOT_FOUND" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/product/products.query.ts
import { GraphQLError as GraphQLError7 } from "graphql";
var resolvers9 = {
  Query: {
    products: async (_, args, context) => {
      try {
        return await context.useCases.getProducts.execute(args);
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError7(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/queries/product/index.ts
var productQueryResolvers = mergeResolvers4([resolvers8, resolvers9]);

// src/infrastructure/graphql/resolvers/queries/index.ts
var queryResolvers = mergeResolvers5([
  userQueryResolvers,
  serviceQueryResolvers,
  scheduleQueryResolvers,
  productQueryResolvers
]);

// src/infrastructure/graphql/resolvers/mutations/index.ts
import { mergeResolvers as mergeResolvers11 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/user/index.ts
import { mergeResolvers as mergeResolvers6 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/user/registerUser.mutation.ts
import { GraphQLError as GraphQLError8 } from "graphql";

// src/domain/@shared/errors/conflictError.ts
var ConflictError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/registerUser.mutation.ts
var resolvers10 = {
  RegisterUserPayload: {
    __resolveType(obj) {
      if ("user" in obj) return "RegisterUserSuccess";
      return "UserAlreadyExistsError";
    }
  },
  Mutation: {
    registerUser: async (_, { input }, context) => {
      try {
        const user = await context.useCases.registerUser.execute(input);
        return { user };
      } catch (error) {
        if (error instanceof ConflictError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError8(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/updateUser.mutation.ts
import { GraphQLError as GraphQLError9 } from "graphql";
var resolvers11 = {
  UpdateUserPayload: {
    __resolveType(obj) {
      if ("user" in obj) return "UpdateUserSuccess";
      if (obj.__kind === "UserNotFoundError") return "UserNotFoundError";
      return "UserAlreadyExistsError";
    }
  },
  Mutation: {
    updateUser: async (_, { input }, context) => {
      try {
        const user = await context.useCases.updateUser.execute(input);
        return { user };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: "UserNotFoundError", message: error.message };
        }
        if (error instanceof ConflictError) {
          return { __kind: "UserAlreadyExistsError", message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError9(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/deleteUser.mutation.ts
import { GraphQLError as GraphQLError10 } from "graphql";
var resolvers12 = {
  DeleteUserPayload: {
    __resolveType(obj) {
      if ("id" in obj) return "DeleteUserSuccess";
      return "UserNotFoundError";
    }
  },
  Mutation: {
    deleteUser: async (_, { input }, context) => {
      try {
        return await context.useCases.deleteUser.execute(input);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError10(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/index.ts
var userMutationResolvers = mergeResolvers6([resolvers10, resolvers11, resolvers12]);

// src/infrastructure/graphql/resolvers/mutations/auth/index.ts
import { mergeResolvers as mergeResolvers7 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/auth/login.mutation.ts
import { GraphQLError as GraphQLError11 } from "graphql";

// src/domain/@shared/errors/unathorizedError.ts
var UnathorizedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UnathorizedError";
  }
};

// src/infrastructure/graphql/resolvers/mutations/auth/login.mutation.ts
var resolvers13 = {
  LoginPayload: {
    __resolveType(obj) {
      if ("token" in obj) return "LoginSuccess";
      return "InvalidCredentialsError";
    }
  },
  Mutation: {
    login: async (_, { input }, context) => {
      try {
        return await context.useCases.login.execute(input);
      } catch (error) {
        if (error instanceof UnathorizedError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError11(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/auth/logout.mutation.ts
var resolvers14 = {
  Mutation: {
    logout: async (_, __, context) => {
      return context.useCases.logout.execute();
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/auth/index.ts
var authMutationResolvers = mergeResolvers7([resolvers13, resolvers14]);

// src/infrastructure/graphql/resolvers/mutations/service/index.ts
import { mergeResolvers as mergeResolvers8 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/service/registerService.mutation.ts
import { GraphQLError as GraphQLError12 } from "graphql";
var resolvers15 = {
  RegisterServicePayload: {
    __resolveType(obj) {
      if ("service" in obj) return "RegisterServiceSuccess";
      return "ServiceAlreadyExistsError";
    }
  },
  Mutation: {
    registerService: async (_, { input }, context) => {
      try {
        const service = await context.useCases.registerService.execute(input);
        return { service };
      } catch (error) {
        if (error instanceof ConflictError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError12(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/service/updateService.mutation.ts
import { GraphQLError as GraphQLError13 } from "graphql";
var resolvers16 = {
  UpdateServicePayload: {
    __resolveType(obj) {
      if ("service" in obj) return "UpdateServiceSuccess";
      if (obj.__kind === "ServiceNotFoundError") return "ServiceNotFoundError";
      return "ServiceAlreadyExistsError";
    }
  },
  Mutation: {
    updateService: async (_, { input }, context) => {
      try {
        const service = await context.useCases.updateService.execute(input);
        return { service };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: "ServiceNotFoundError", message: error.message };
        }
        if (error instanceof ConflictError) {
          return { __kind: "ServiceAlreadyExistsError", message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError13(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/service/deleteService.mutation.ts
import { GraphQLError as GraphQLError14 } from "graphql";
var resolvers17 = {
  DeleteServicePayload: {
    __resolveType(obj) {
      if ("id" in obj) return "DeleteServiceSuccess";
      return "ServiceNotFoundError";
    }
  },
  Mutation: {
    deleteService: async (_, { input }, context) => {
      try {
        return await context.useCases.deleteService.execute(input);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError14(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/service/index.ts
var serviceMutationResolvers = mergeResolvers8([
  resolvers15,
  resolvers16,
  resolvers17
]);

// src/infrastructure/graphql/resolvers/mutations/schedule/index.ts
import { mergeResolvers as mergeResolvers9 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/schedule/registerSchedule.mutation.ts
import { GraphQLError as GraphQLError15 } from "graphql";

// src/infrastructure/graphql/helpers/stream-to-buffer.ts
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// src/infrastructure/graphql/resolvers/mutations/schedule/registerSchedule.mutation.ts
var USER_NOT_FOUND_KIND = "__userNotFound";
var SERVICE_NOT_FOUND_KIND = "__serviceNotFound";
var CONFLICT_KIND = "__conflict";
var resolvers18 = {
  RegisterSchedulePayload: {
    __resolveType(obj) {
      if ("schedule" in obj) return "RegisterScheduleSuccess";
      if (USER_NOT_FOUND_KIND in obj) return "UserNotFoundError";
      if (SERVICE_NOT_FOUND_KIND in obj) return "ServiceNotFoundError";
      if (CONFLICT_KIND in obj) return "ScheduleAlreadyBookedError";
      return null;
    }
  },
  Mutation: {
    registerSchedule: async (_, { input }, context) => {
      try {
        let photoUrl = input.photoUrl ?? null;
        if (input.photo) {
          const file = await input.photo;
          const buffer = await streamToBuffer(file.createReadStream());
          const uploaded = await context.useCases.uploadPhoto.execute({
            buffer,
            filename: file.filename,
            mimetype: file.mimetype
          });
          photoUrl = uploaded.url;
        }
        const dto = await context.useCases.registerSchedule.execute({
          userId: input.userId,
          serviceId: input.serviceId,
          date: new Date(input.date),
          status: input.status,
          photoUrl
        });
        return {
          schedule: {
            id: dto.id,
            userId: dto.userId,
            serviceId: dto.serviceId,
            status: dto.status,
            date: dto.date,
            photoUrl: dto.photoUrl,
            createdAt: dto.createdAt
          }
        };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          if (error.message.startsWith("User not found")) {
            return { [USER_NOT_FOUND_KIND]: true, message: error.message };
          }
          if (error.message.startsWith("Service not found")) {
            return { [SERVICE_NOT_FOUND_KIND]: true, message: error.message };
          }
        }
        if (error instanceof ConflictError) {
          return { [CONFLICT_KIND]: true, message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError15(error.message, {
            extensions: { code: "BAD_USER_INPUT" }
          });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/schedule/updateSchedule.mutation.ts
import { GraphQLError as GraphQLError16 } from "graphql";
var SCHEDULE_NOT_FOUND_KIND = "__scheduleNotFound";
var SERVICE_NOT_FOUND_KIND2 = "__serviceNotFound";
var CONFLICT_KIND2 = "__conflict";
var resolvers19 = {
  UpdateSchedulePayload: {
    __resolveType(obj) {
      if ("schedule" in obj) return "UpdateScheduleSuccess";
      if (SCHEDULE_NOT_FOUND_KIND in obj) return "ScheduleNotFoundError";
      if (SERVICE_NOT_FOUND_KIND2 in obj) return "ServiceNotFoundError";
      if (CONFLICT_KIND2 in obj) return "ScheduleAlreadyBookedError";
      return null;
    }
  },
  Mutation: {
    updateSchedule: async (_, { input }, context) => {
      try {
        let photoUrl = input.photoUrl ?? null;
        if (input.photo) {
          const file = await input.photo;
          const buffer = await streamToBuffer(file.createReadStream());
          const uploaded = await context.useCases.uploadPhoto.execute({
            buffer,
            filename: file.filename,
            mimetype: file.mimetype
          });
          photoUrl = uploaded.url;
        }
        const dto = await context.useCases.updateSchedule.execute({
          id: input.id,
          status: input.status,
          date: input.date ? new Date(input.date) : void 0,
          serviceId: input.serviceId ?? void 0,
          photoUrl
        });
        return {
          schedule: {
            id: dto.id,
            userId: dto.userId,
            serviceId: dto.serviceId,
            status: dto.status,
            date: dto.date,
            photoUrl: dto.photoUrl,
            createdAt: dto.createdAt
          }
        };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          if (error.message.startsWith("Schedule not found")) {
            return { [SCHEDULE_NOT_FOUND_KIND]: true, message: error.message };
          }
          if (error.message.startsWith("Service not found")) {
            return { [SERVICE_NOT_FOUND_KIND2]: true, message: error.message };
          }
        }
        if (error instanceof ConflictError) {
          return { [CONFLICT_KIND2]: true, message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError16(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/schedule/deleteSchedule.mutation.ts
import { GraphQLError as GraphQLError17 } from "graphql";
var resolvers20 = {
  DeleteSchedulePayload: {
    __resolveType(obj) {
      if ("id" in obj) return "DeleteScheduleSuccess";
      return "ScheduleNotFoundError";
    }
  },
  Mutation: {
    deleteSchedule: async (_, { input }, context) => {
      try {
        return await context.useCases.deleteSchedule.execute(input);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError17(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/schedule/completeSchedule.mutation.ts
import { GraphQLError as GraphQLError18 } from "graphql";
var SCHEDULE_NOT_FOUND_KIND2 = "__scheduleNotFound";
var SERVICE_NOT_FOUND_KIND3 = "__serviceNotFound";
var PRODUCT_NOT_FOUND_KIND = "__productNotFound";
var NOT_COMPLETABLE_KIND = "__notCompletable";
var resolvers21 = {
  CompleteSchedulePayload: {
    __resolveType(obj) {
      if ("schedule" in obj) return "CompleteScheduleSuccess";
      if (SCHEDULE_NOT_FOUND_KIND2 in obj) return "ScheduleNotFoundError";
      if (SERVICE_NOT_FOUND_KIND3 in obj) return "ServiceNotFoundError";
      if (PRODUCT_NOT_FOUND_KIND in obj) return "ProductNotFoundError";
      if (NOT_COMPLETABLE_KIND in obj) return "ScheduleNotCompletableError";
      return null;
    }
  },
  Mutation: {
    completeSchedule: async (_, { input }, context) => {
      try {
        const dto = await context.useCases.completeSchedule.execute({
          scheduleId: input.scheduleId,
          productIds: input.productIds,
          tip: input.tip
        });
        return {
          schedule: {
            id: dto.id,
            userId: dto.userId,
            serviceId: dto.serviceId,
            status: dto.status,
            date: dto.date,
            photoUrl: dto.photoUrl,
            tip: dto.tip,
            createdAt: dto.createdAt
          }
        };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          if (error.message.startsWith("Schedule not found")) {
            return { [SCHEDULE_NOT_FOUND_KIND2]: true, message: error.message };
          }
          if (error.message.startsWith("Service not found")) {
            return { [SERVICE_NOT_FOUND_KIND3]: true, message: error.message };
          }
          if (error.message.startsWith("Product not found")) {
            return { [PRODUCT_NOT_FOUND_KIND]: true, message: error.message };
          }
        }
        if (error instanceof ConflictError) {
          return { [NOT_COMPLETABLE_KIND]: true, message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError18(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/schedule/index.ts
var scheduleMutationResolvers = mergeResolvers9([
  resolvers18,
  resolvers19,
  resolvers20,
  resolvers21
]);

// src/infrastructure/graphql/resolvers/mutations/product/index.ts
import { mergeResolvers as mergeResolvers10 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/product/registerProduct.mutation.ts
import { GraphQLError as GraphQLError19 } from "graphql";
var resolvers22 = {
  RegisterProductPayload: {
    __resolveType(obj) {
      if ("product" in obj) return "RegisterProductSuccess";
      return "ProductAlreadyExistsError";
    }
  },
  Mutation: {
    registerProduct: async (_, { input }, context) => {
      try {
        const product = await context.useCases.registerProduct.execute(input);
        return { product };
      } catch (error) {
        if (error instanceof ConflictError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError19(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/product/updateProduct.mutation.ts
import { GraphQLError as GraphQLError20 } from "graphql";
var resolvers23 = {
  UpdateProductPayload: {
    __resolveType(obj) {
      if ("product" in obj) return "UpdateProductSuccess";
      if (obj.__kind === "ProductNotFoundError") return "ProductNotFoundError";
      return "ProductAlreadyExistsError";
    }
  },
  Mutation: {
    updateProduct: async (_, { input }, context) => {
      try {
        const product = await context.useCases.updateProduct.execute(input);
        return { product };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: "ProductNotFoundError", message: error.message };
        }
        if (error instanceof ConflictError) {
          return { __kind: "ProductAlreadyExistsError", message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError20(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/product/deleteProduct.mutation.ts
import { GraphQLError as GraphQLError21 } from "graphql";
var resolvers24 = {
  DeleteProductPayload: {
    __resolveType(obj) {
      if ("id" in obj) return "DeleteProductSuccess";
      return "ProductNotFoundError";
    }
  },
  Mutation: {
    deleteProduct: async (_, { input }, context) => {
      try {
        return await context.useCases.deleteProduct.execute(input);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError21(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/product/index.ts
var productMutationResolvers = mergeResolvers10([
  resolvers22,
  resolvers23,
  resolvers24
]);

// src/infrastructure/graphql/resolvers/mutations/index.ts
var mutationResolvers = mergeResolvers11([
  userMutationResolvers,
  authMutationResolvers,
  serviceMutationResolvers,
  scheduleMutationResolvers,
  productMutationResolvers
]);

// src/infrastructure/graphql/resolvers/field_resolvers/index.ts
import { mergeResolvers as mergeResolvers14 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/field_resolvers/user/index.ts
import { mergeResolvers as mergeResolvers12 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/field_resolvers/user/user.fields.ts
var resolvers25 = {
  User: {
    role: async (parent, _, context) => {
      return context.dataLoaders.role.load(parent.roleId);
    }
  }
};

// src/infrastructure/graphql/resolvers/field_resolvers/user/index.ts
var userTypeResolvers = mergeResolvers12([resolvers25]);

// src/infrastructure/graphql/resolvers/field_resolvers/schedule/index.ts
import { mergeResolvers as mergeResolvers13 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/field_resolvers/schedule/schedule.field.ts
import { GraphQLError as GraphQLError22 } from "graphql";
var STATUS_TO_GRAPHQL = {
  pending: "pending",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled"
};
var resolvers26 = {
  Schedule: {
    status: (parent) => STATUS_TO_GRAPHQL[parent.status] ?? parent.status,
    user: async (parent, _, context) => {
      const user = await context.dataLoaders.user.load(parent.userId);
      if (!user) {
        throw new GraphQLError22(`User not found: ${parent.userId}`, {
          extensions: { code: "NOT_FOUND" }
        });
      }
      return user;
    },
    service: async (parent, _, context) => {
      const service = await context.dataLoaders.service.load(parent.serviceId);
      if (!service) {
        throw new GraphQLError22(`Service not found: ${parent.serviceId}`, {
          extensions: { code: "NOT_FOUND" }
        });
      }
      return service;
    },
    products: (parent, _, context) => context.dataLoaders.scheduleProducts.load(parent.id),
    discount: (parent, _, context) => context.dataLoaders.scheduleDiscount.load(parent.id),
    finalPrice: async (parent, _, context) => {
      const [discount, service] = await Promise.all([
        context.dataLoaders.scheduleDiscount.load(parent.id),
        context.dataLoaders.service.load(parent.serviceId)
      ]);
      const percentage = discount?.percentage ?? 0;
      return Number(service?.price) * (1 - percentage / 100);
    }
  }
};

// src/infrastructure/graphql/resolvers/field_resolvers/schedule/index.ts
var scheduleTypeResolvers = mergeResolvers13([resolvers26]);

// src/infrastructure/graphql/resolvers/field_resolvers/index.ts
var fieldResolvers = mergeResolvers14([userTypeResolvers, scheduleTypeResolvers]);

// src/infrastructure/graphql/resolvers/index.ts
var resolvers27 = mergeResolvers15([
  queryResolvers,
  mutationResolvers,
  fieldResolvers,
  { Upload: GraphQLUpload }
]);

// src/infrastructure/graphql/helpers/extract-berarer-token.ts
function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

// src/infrastructure/graphql/dataloaders/role/role.dataloader.ts
import DataLoader from "dataloader";

// src/infrastructure/db/schema/roles.schema.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
var roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// src/infrastructure/graphql/dataloaders/role/role.dataloader.ts
import { inArray } from "drizzle-orm";
function createRoleDataLoader(db2) {
  return new DataLoader(async (ids) => {
    const rows = await db2.select({ id: roles.id, name: roles.name }).from(roles).where(inArray(roles.id, [...ids]));
    const hashMap = new Map(rows.map((row) => [row.id, row]));
    return ids.map((id) => hashMap.get(id) ?? null);
  });
}

// src/infrastructure/graphql/dataloaders/user/user.dataloader.ts
import DataLoader2 from "dataloader";

// src/infrastructure/db/schema/users.schema.ts
import { pgTable as pgTable2, uuid as uuid2, varchar as varchar2, timestamp as timestamp2, date } from "drizzle-orm/pg-core";
var users = pgTable2("users", {
  id: uuid2("id").primaryKey().defaultRandom(),
  role_id: uuid2("role_id").notNull().references(() => roles.id),
  name: varchar2("name", { length: 100 }).notNull(),
  email: varchar2("email", { length: 150 }).notNull().unique(),
  password: varchar2("password", { length: 255 }).notNull(),
  phone_number: varchar2("phone_number", { length: 20 }).notNull(),
  birth_date: date("birth_date"),
  createdAt: timestamp2("created_at").notNull().defaultNow(),
  updatedAt: timestamp2("updated_at").notNull().defaultNow()
});

// src/infrastructure/graphql/dataloaders/user/user.dataloader.ts
import { inArray as inArray2 } from "drizzle-orm";
function createUserDataLoader(db2) {
  return new DataLoader2(async (ids) => {
    const rows = await db2.select({
      id: users.id,
      roleId: users.role_id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phone_number,
      birthDate: users.birth_date,
      createdAt: users.createdAt
    }).from(users).where(inArray2(users.id, [...ids]));
    const usersHashMap = /* @__PURE__ */ new Map();
    for (const row of rows) {
      usersHashMap.set(row.id, {
        id: row.id,
        roleId: row.roleId,
        name: row.name,
        email: row.email,
        phoneNumber: row.phoneNumber,
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split("T")[0] : null,
        createdAt: row.createdAt.toISOString()
      });
    }
    return ids.map((id) => usersHashMap.get(id) ?? null);
  });
}

// src/infrastructure/graphql/dataloaders/service/service.dataloader.ts
import DataLoader3 from "dataloader";
import { inArray as inArray3 } from "drizzle-orm";

// src/infrastructure/db/schema/services.schema.ts
import { pgTable as pgTable3, uuid as uuid3, varchar as varchar3, decimal, integer, timestamp as timestamp3, pgEnum } from "drizzle-orm/pg-core";
var serviceCategoryEnum = pgEnum("service_category", ["nails", "eyebrows"]);
var services = pgTable3("services", {
  id: uuid3("id").primaryKey().defaultRandom(),
  name: varchar3("name", { length: 100 }).notNull(),
  category: serviceCategoryEnum("category").notNull().default("nails"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow()
});

// src/infrastructure/graphql/dataloaders/service/service.dataloader.ts
function createServiceDataLoader(db2) {
  return new DataLoader3(async (ids) => {
    const rows = await db2.select({
      id: services.id,
      name: services.name,
      category: services.category,
      price: services.price,
      durationMinutes: services.durationMinutes,
      createdAt: services.createdAt
    }).from(services).where(inArray3(services.id, [...ids]));
    const map = /* @__PURE__ */ new Map();
    for (const row of rows) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        durationMinutes: row.durationMinutes,
        createdAt: row.createdAt.toISOString()
      });
    }
    return ids.map((id) => map.get(id) ?? null);
  });
}

// src/infrastructure/graphql/dataloaders/schedule-products/schedule-products.dataloader.ts
import DataLoader4 from "dataloader";
import { eq, inArray as inArray4 } from "drizzle-orm";

// src/infrastructure/db/schema/schedule-products.schema.ts
import { pgTable as pgTable6, uuid as uuid6, timestamp as timestamp6, unique } from "drizzle-orm/pg-core";

// src/infrastructure/db/schema/schedules.schema.ts
import { pgEnum as pgEnum2, pgTable as pgTable4, uuid as uuid4, varchar as varchar4, timestamp as timestamp4, numeric } from "drizzle-orm/pg-core";
var scheduleStatusEnum = pgEnum2("schedule_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled"
]);
var schedules = pgTable4("schedules", {
  id: uuid4("id").primaryKey().defaultRandom(),
  userId: uuid4("user_id").notNull().references(() => users.id),
  serviceId: uuid4("service_id").notNull().references(() => services.id),
  status: scheduleStatusEnum("status").notNull().default("pending"),
  date: timestamp4("date", { withTimezone: true }).notNull(),
  photoUrl: varchar4("photo_url", { length: 500 }),
  tip: numeric("tip", { precision: 10, scale: 2 }),
  createdAt: timestamp4("created_at").notNull().defaultNow(),
  updatedAt: timestamp4("updated_at").notNull().defaultNow()
});

// src/infrastructure/db/schema/products.schema.ts
import { pgTable as pgTable5, uuid as uuid5, varchar as varchar5, boolean, timestamp as timestamp5 } from "drizzle-orm/pg-core";
var products = pgTable5("products", {
  id: uuid5("id").primaryKey().defaultRandom(),
  name: varchar5("name", { length: 100 }).notNull(),
  brand: varchar5("brand", { length: 100 }).notNull(),
  color: varchar5("color", { length: 50 }),
  category: serviceCategoryEnum("category").notNull().default("nails"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp5("created_at").notNull().defaultNow(),
  updatedAt: timestamp5("updated_at").notNull().defaultNow()
});

// src/infrastructure/db/schema/schedule-products.schema.ts
var scheduleProducts = pgTable6(
  "schedule_products",
  {
    id: uuid6("id").primaryKey().defaultRandom(),
    scheduleId: uuid6("schedule_id").notNull().references(() => schedules.id, { onDelete: "cascade" }),
    productId: uuid6("product_id").notNull().references(() => products.id),
    createdAt: timestamp6("created_at").notNull().defaultNow(),
    updatedAt: timestamp6("updated_at").notNull().defaultNow()
  },
  (t) => ({ uniqueScheduleProduct: unique().on(t.scheduleId, t.productId) })
);

// src/infrastructure/graphql/dataloaders/schedule-products/schedule-products.dataloader.ts
function createScheduleProductsDataLoader(db2) {
  return new DataLoader4(async (scheduleIds) => {
    const rows = await db2.select({
      scheduleId: scheduleProducts.scheduleId,
      id: products.id,
      name: products.name,
      brand: products.brand,
      category: products.category,
      color: products.color,
      isAvailable: products.isAvailable,
      createdAt: products.createdAt
    }).from(scheduleProducts).innerJoin(products, eq(scheduleProducts.productId, products.id)).where(inArray4(scheduleProducts.scheduleId, [...scheduleIds]));
    const map = /* @__PURE__ */ new Map();
    for (const row of rows) {
      const list = map.get(row.scheduleId) ?? [];
      list.push({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        color: row.color,
        isAvailable: row.isAvailable,
        createdAt: row.createdAt.toISOString()
      });
      map.set(row.scheduleId, list);
    }
    return scheduleIds.map((id) => map.get(id) ?? []);
  });
}

// src/infrastructure/graphql/dataloaders/schedule-discount/schedule-discount.dataloader.ts
import DataLoader5 from "dataloader";
import { inArray as inArray5 } from "drizzle-orm";

// src/infrastructure/db/schema/schedule-discounts.schema.ts
import { pgEnum as pgEnum3, pgTable as pgTable7, uuid as uuid7, numeric as numeric2, timestamp as timestamp7, unique as unique2 } from "drizzle-orm/pg-core";
var discountReasonEnum = pgEnum3("discount_reason", ["loyalty", "birthday"]);
var scheduleDiscounts = pgTable7(
  "schedule_discounts",
  {
    id: uuid7("id").primaryKey().defaultRandom(),
    scheduleId: uuid7("schedule_id").notNull().references(() => schedules.id, { onDelete: "cascade" }),
    userId: uuid7("user_id").notNull().references(() => users.id),
    reason: discountReasonEnum("reason").notNull(),
    percentage: numeric2("percentage", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp7("created_at").notNull().defaultNow(),
    updatedAt: timestamp7("updated_at").notNull().defaultNow()
  },
  (t) => ({ uniqueScheduleDiscount: unique2().on(t.scheduleId) })
);

// src/infrastructure/graphql/dataloaders/schedule-discount/schedule-discount.dataloader.ts
function createScheduleDiscountDataLoader(db2) {
  return new DataLoader5(async (scheduleIds) => {
    const rows = await db2.select({
      scheduleId: scheduleDiscounts.scheduleId,
      reason: scheduleDiscounts.reason,
      percentage: scheduleDiscounts.percentage
    }).from(scheduleDiscounts).where(inArray5(scheduleDiscounts.scheduleId, [...scheduleIds]));
    const map = new Map(
      rows.map((r) => [r.scheduleId, { reason: r.reason, percentage: Number(r.percentage) }])
    );
    return scheduleIds.map((id) => map.get(id) ?? null);
  });
}

// src/infrastructure/graphql/buildContext.ts
function buildContext(useCases, db2, jwtAdapter) {
  return async ({ req }) => {
    const token = extractBearerToken(req.headers.authorization);
    let currentUser = null;
    if (token) {
      try {
        currentUser = jwtAdapter.verify(token);
      } catch {
        currentUser = null;
      }
    }
    return {
      currentUser,
      useCases,
      dataLoaders: {
        role: createRoleDataLoader(db2),
        user: createUserDataLoader(db2),
        service: createServiceDataLoader(db2),
        scheduleProducts: createScheduleProductsDataLoader(db2),
        scheduleDiscount: createScheduleDiscountDataLoader(db2)
      }
    };
  };
}

// src/infrastructure/container.ts
import { Pool } from "pg";

// src/infrastructure/constants/env.ts
import { resolve } from "path";
var getEnv = (key, defaultValue) => {
  const value = process.env[key] ?? defaultValue;
  if (value === void 0) throw new Error(`Missing environment variable: ${key}`);
  return value;
};
var NODE_ENV = getEnv("NODE_ENV", "development");
var PORT = Number(getEnv("PORT", "8000"));
var DATABASE_URL = getEnv("DATABASE_URL");
var REDIS_URL = getEnv("REDIS_URL");
var JWT_SECRET = getEnv("JWT_SECRET");
var JWT_EXPIRES_IN = getEnv("JWT_EXPIRES_IN");
var PUBLIC_BASE_URL = getEnv("PUBLIC_BASE_URL", "http://localhost:8000");
var ASSETS_DIR = resolve(process.cwd(), getEnv("ASSETS_DIR", "assets"));
var FEATURE_FLAGS_PATH = resolve(
  process.cwd(),
  getEnv("FEATURE_FLAGS_PATH", "feature-flags.json")
);

// src/infrastructure/container.ts
import { drizzle } from "drizzle-orm/node-postgres";

// src/infrastructure/repository/user.repository.ts
import { asc, eq as eq2 } from "drizzle-orm";

// src/domain/entity/user/factory/user.factory.ts
import { randomUUID } from "crypto";

// src/domain/@shared/entity/entity.abstract.ts
var Entity = class {
  _id;
  _createdAt;
  _updatedAt;
  constructor(id, createdAt, updatedAt) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }
  get id() {
    return this._id;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
  equals(other) {
    return this._id === other._id;
  }
};

// src/domain/@shared/value-object/value-object.abstract.ts
var ValueObject = class {
  _value;
  constructor(value) {
    this._value = value;
  }
  get value() {
    return this._value;
  }
  equals(other) {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }
};

// src/domain/@shared/value-object/email/email.vo.ts
var Email = class extends ValueObject {
  constructor(value) {
    const lowerCaseValue = value.toLowerCase().trim();
    if (!lowerCaseValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerCaseValue)) {
      throw new InvalidValueError(`Invalid email: ${value}`);
    }
    super(lowerCaseValue);
  }
};

// src/domain/@shared/value-object/phone/phone.vo.ts
var Phone = class extends ValueObject {
  constructor(value) {
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidValueError(`Invalid phone: ${value}`);
    super(trimmed);
  }
};

// src/domain/entity/user/user.entity.ts
var User = class _User extends Entity {
  _roleId;
  _name;
  _email;
  _passwordHash;
  _phone;
  _birthDate;
  constructor(props) {
    super(props.id, props.createdAt, props.updatedAt);
    this._roleId = props.roleId;
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._phone = props.phone;
    this._birthDate = props.birthDate;
  }
  static _instantiate(props) {
    return new _User(props);
  }
  get roleId() {
    return this._roleId;
  }
  get name() {
    return this._name;
  }
  get email() {
    return this._email;
  }
  get passwordHash() {
    return this._passwordHash;
  }
  get phone() {
    return this._phone;
  }
  get birthDate() {
    return this._birthDate;
  }
  updateUserProfile(props) {
    if (props.name !== void 0) this._name = props.name;
    if (props.email !== void 0) this._email = new Email(props.email);
    if (props.phoneNumber !== void 0) this._phone = new Phone(props.phoneNumber);
    if (props.birthDate !== void 0) {
      this._birthDate = props.birthDate ? new Date(props.birthDate) : null;
    }
    this._updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/domain/entity/user/factory/user.factory.ts
var UserFactory = class {
  static create(props) {
    const now = /* @__PURE__ */ new Date();
    return User._instantiate({
      id: randomUUID(),
      roleId: props.roleId,
      name: props.name,
      email: new Email(props.email),
      passwordHash: props.passwordHash,
      phone: new Phone(props.phoneNumber),
      birthDate: props.birthDate ? new Date(props.birthDate) : null,
      createdAt: now,
      updatedAt: now
    });
  }
  static reconstitute(props) {
    return User._instantiate({
      id: props.id,
      roleId: props.roleId,
      name: props.name,
      email: new Email(props.email),
      passwordHash: props.passwordHash,
      phone: new Phone(props.phoneNumber),
      birthDate: props.birthDate,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }
};

// src/infrastructure/repository/user.repository.ts
var UserRepository = class {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async findById(id) {
    const rows = await this.db.select().from(users).where(eq2(users.id, id)).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return UserFactory.reconstitute({
      id: row.id,
      roleId: row.role_id,
      name: row.name,
      email: row.email,
      passwordHash: row.password,
      phoneNumber: row.phone_number,
      birthDate: row.birth_date ? new Date(row.birth_date) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async findByEmail(email) {
    const rows = await this.db.select().from(users).where(eq2(users.email, email)).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return UserFactory.reconstitute({
      id: row.id,
      roleId: row.role_id,
      name: row.name,
      email: row.email,
      passwordHash: row.password,
      phoneNumber: row.phone_number,
      birthDate: row.birth_date ? new Date(row.birth_date) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async findAll(params) {
    const rows = await this.db.select().from(users).orderBy(asc(users.createdAt), asc(users.id)).limit(params.limit).offset(params.offset);
    const rowsForResponse = rows.map(
      (row) => UserFactory.reconstitute({
        id: row.id,
        roleId: row.role_id,
        name: row.name,
        email: row.email,
        passwordHash: row.password,
        phoneNumber: row.phone_number,
        birthDate: row.birth_date ? new Date(row.birth_date) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
    return rowsForResponse;
  }
  async findRoleIdByName(name) {
    const rows = await this.db.select().from(roles).where(eq2(roles.name, name)).limit(1);
    if (rows.length === 0) return null;
    const { id } = rows[0];
    return id;
  }
  async save(user) {
    await this.db.insert(users).values({
      id: user.id,
      role_id: user.roleId,
      name: user.name,
      email: user.email.value,
      password: user.passwordHash,
      phone_number: user.phone.value,
      birth_date: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }
  async update(user) {
    await this.db.update(users).set({
      name: user.name,
      email: user.email.value,
      phone_number: user.phone.value,
      birth_date: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
      updatedAt: user.updatedAt
    }).where(eq2(users.id, user.id));
  }
  async delete(id) {
    await this.db.delete(users).where(eq2(users.id, id));
  }
};

// src/infrastructure/adapters/bcrypt.adapter.ts
import bcrypt from "bcryptjs";
var BcryptAdapter = class {
  saltRounds = 10;
  async hash(plain) {
    return bcrypt.hash(plain, this.saltRounds);
  }
  async compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
};

// src/infrastructure/adapters/zod.adapter.ts
var ZodAdapter = class {
  validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new InvalidValueError(result.error.issues.map((error) => error.message).join(", "));
    }
    return result.data;
  }
};

// src/usecase/users/register-user/register-user.schema-validator.ts
import { z } from "zod";
var registerUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(9),
  birthDate: z.string().nullable().optional()
});

// src/usecase/users/register-user/register-user.usecase.ts
var RegisterUserUseCase = class {
  userRepository;
  hashAdapter;
  validationAdapter;
  constructor(userRepository, hashAdapter, validationAdapter) {
    this.userRepository = userRepository;
    this.hashAdapter = hashAdapter;
    this.validationAdapter = validationAdapter;
  }
  async execute(inputDto) {
    const validatedData = this.validationAdapter.validate(
      registerUserSchema,
      inputDto
    );
    const userAlreadyExist = await this.userRepository.findByEmail(validatedData.email);
    if (userAlreadyExist)
      throw new ConflictError(`Email already registered: ${validatedData.email}`);
    const clientRoleId = await this.userRepository.findRoleIdByName("client");
    if (!clientRoleId) throw new EntityNotFoundError("Role 'client' not found");
    const passwordHash = await this.hashAdapter.hash(validatedData.password);
    const user = UserFactory.create({
      roleId: clientRoleId,
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      phoneNumber: validatedData.phoneNumber,
      birthDate: validatedData.birthDate
    });
    await this.userRepository.save(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      phoneNumber: user.phone.value,
      birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
      createdAt: user.createdAt.toISOString()
    };
  }
};

// src/usecase/shared/cursor.ts
var PREFIX = "cursor:";
function encodeCursor(offset) {
  return Buffer.from(`${PREFIX}${offset}`).toString("base64");
}
function decodeCursor(cursor) {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  if (!decoded.startsWith(PREFIX)) {
    throw new InvalidValueError(`Invalid cursor: ${cursor}`);
  }
  const offset = Number(decoded.slice(PREFIX.length));
  if (!Number.isInteger(offset) || offset < 0) {
    throw new InvalidValueError(`Invalid cursor offset: ${cursor}`);
  }
  return offset;
}

// src/usecase/users/get-users/get-users.usecase.ts
var DEFAULT_PAGE_SIZE = 20;
var MAX_PAGE_SIZE = 100;
var GetUsersUseCase = class {
  userRepository;
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async execute(input) {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const rows = await this.userRepository.findAll({ limit: first + 1, offset });
    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;
    const edges = items.map((user, index) => {
      const node = {
        id: user.id,
        roleId: user.roleId,
        name: user.name,
        email: user.email.value,
        phoneNumber: user.phone.value,
        birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
        createdAt: user.createdAt.toISOString()
      };
      return { node, cursor: encodeCursor(offset + index) };
    });
    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
      }
    };
  }
};

// src/usecase/users/get-user/get-user.usecase.ts
var GetUserUseCase = class {
  userRepository;
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async execute(input) {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new EntityNotFoundError(`User with id ${input.id} not found`);
    }
    return {
      id: user.id,
      roleId: user.roleId,
      name: user.name,
      email: user.email.value,
      phoneNumber: user.phone.value,
      birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
      createdAt: user.createdAt.toISOString()
    };
  }
};

// src/usecase/auth/login/login.schema-validator.ts
import { z as z2 } from "zod";
var loginUserSchema = z2.object({
  email: z2.string().email("Invalid email format"),
  password: z2.string().min(1, "Password is required")
});

// src/usecase/auth/login/login.usecase.ts
var LoginUseCase = class {
  userRepository;
  hashAdapter;
  jwtAdapter;
  validationAdapter;
  constructor(userRepository, hashAdapter, jwtAdapter, validationAdapter) {
    this.userRepository = userRepository;
    this.hashAdapter = hashAdapter;
    this.jwtAdapter = jwtAdapter;
    this.validationAdapter = validationAdapter;
  }
  async execute(inputDto) {
    const inputValid = this.validationAdapter.validate(
      loginUserSchema,
      inputDto
    );
    const normalizedEmail = inputValid.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) throw new UnathorizedError("Invalid Credentials");
    const isPasswordMatch = await this.hashAdapter.compare(inputValid.password, user.passwordHash);
    if (!isPasswordMatch) throw new UnathorizedError("Invalid Credentials");
    const token = this.jwtAdapter.sign({
      sub: user.id,
      roleId: user.roleId,
      email: user.email.value
    });
    return {
      token,
      user: {
        id: user.id,
        roleId: user.roleId,
        name: user.name,
        email: user.email.value,
        phoneNumber: user.phone.value,
        birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
        createdAt: user.createdAt.toISOString()
      }
    };
  }
};

// src/infrastructure/adapters/jwt.adapter.ts
import jwt from "jsonwebtoken";
var JwtAdapter = class {
  secret;
  constructor(secret) {
    this.secret = secret;
  }
  sign(payload) {
    const jwtExpiresIn = JWT_EXPIRES_IN ?? "7d";
    return jwt.sign(payload, this.secret, {
      expiresIn: jwtExpiresIn
    });
  }
  verify(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      throw new UnathorizedError("Invalid or expired token");
    }
  }
};

// src/usecase/auth/logout/logout.usecase.ts
var LogoutUseCase = class {
  async execute() {
    return {
      success: true
    };
  }
};

// src/usecase/users/update-user/update-user.schema-validator.ts
import { z as z3 } from "zod";
var updateUserSchema = z3.object({
  id: z3.string().uuid(),
  name: z3.string().min(1).optional(),
  email: z3.email().optional(),
  phoneNumber: z3.string().min(9).optional(),
  birthDate: z3.string().nullable().optional()
});

// src/usecase/users/update-user/update-user.usecase.ts
var UpdateUserUseCase = class {
  userRepository;
  validationAdapter;
  constructor(userRepository, validationAdapter) {
    this.userRepository = userRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(inputDto) {
    const validated = this.validationAdapter.validate(
      updateUserSchema,
      inputDto
    );
    const user = await this.userRepository.findById(validated.id);
    if (!user) {
      throw new EntityNotFoundError(`User with id ${validated.id} not found`);
    }
    if (validated.email !== void 0 && validated.email !== user.email.value) {
      const existing = await this.userRepository.findByEmail(validated.email);
      if (existing) {
        throw new ConflictError(`Email already registered: ${validated.email}`);
      }
    }
    user.updateUserProfile({
      name: validated.name,
      email: validated.email,
      phoneNumber: validated.phoneNumber,
      birthDate: validated.birthDate
    });
    await this.userRepository.update(user);
    return {
      id: user.id,
      roleId: user.roleId,
      name: user.name,
      email: user.email.value,
      phoneNumber: user.phone.value,
      birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
      createdAt: user.createdAt.toISOString()
    };
  }
};

// src/usecase/users/delete-user/delete-user.schema-validator.ts
import { z as z4 } from "zod";
var deleteUserSchema = z4.object({
  id: z4.uuid()
});

// src/usecase/users/delete-user/delete-user.usecase.ts
var DeleteUserUseCase = class {
  userRepository;
  validationAdapter;
  constructor(userRepository, validationAdapter) {
    this.userRepository = userRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(deleteUserSchema, input);
    const user = await this.userRepository.findById(validated.id);
    if (!user) {
      throw new EntityNotFoundError(`User with id ${validated.id} not found`);
    }
    await this.userRepository.delete(user.id);
    return {
      id: user.id
    };
  }
};

// src/domain/entity/service/factory/service.factory.ts
import { randomUUID as randomUUID2 } from "crypto";

// src/domain/@shared/value-object/price/price.vo.ts
var Price = class extends ValueObject {
  constructor(value) {
    if (!Number.isFinite(value)) {
      throw new InvalidValueError(`Invalid price: ${value}`);
    }
    if (value < 0) {
      throw new InvalidValueError(`Price cannot be negative: ${value}`);
    }
    super(Math.round(value * 100) / 100);
  }
};

// src/domain/@shared/value-object/service-category/service-category.vo.ts
var ALLOWED = /* @__PURE__ */ new Set(["nails", "eyebrows"]);
var ServiceCategory = class extends ValueObject {
  constructor(value) {
    const normalisedValue = value.trim().toLowerCase();
    if (!ALLOWED.has(normalisedValue)) {
      throw new InvalidValueError(`Invalid Service Category: ${value}`);
    }
    super(normalisedValue);
  }
};

// src/domain/entity/service/service.entity.ts
var Service = class _Service extends Entity {
  _name;
  _category;
  _price;
  _durationMinutes;
  constructor(props) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._category = props.category;
    this._price = props.price;
    this._durationMinutes = props.durationMinutes;
  }
  static _instantiate(props) {
    return new _Service(props);
  }
  get name() {
    return this._name;
  }
  get category() {
    return this._category;
  }
  get price() {
    return this._price;
  }
  get durationMinutes() {
    return this._durationMinutes;
  }
  updateServiceDetails(props) {
    if (props.name !== void 0) this._name = props.name;
    if (props.category !== void 0) this._category = new ServiceCategory(props.category);
    if (props.price !== void 0) this._price = new Price(props.price);
    if (props.durationMinutes !== void 0) {
      if (!Number.isInteger(props.durationMinutes) || props.durationMinutes && props.durationMinutes <= 0) {
        throw new InvalidValueError(
          `durationMinutes mus be a positive integer: ${props.durationMinutes}`
        );
      }
      this._durationMinutes = props.durationMinutes;
    }
    this._updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/domain/entity/service/factory/service.factory.ts
var assertPositiveInt = (value) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InvalidValueError(`durationMinutes must be a positive integer: ${value}`);
  }
};
var ServiceFactory = class {
  static create(props) {
    assertPositiveInt(props.durationMinutes);
    const now = /* @__PURE__ */ new Date();
    return Service._instantiate({
      id: randomUUID2(),
      name: props.name,
      category: new ServiceCategory(props.category),
      price: new Price(props.price),
      durationMinutes: props.durationMinutes,
      createdAt: now,
      updatedAt: now
    });
  }
  static reconstitute(props) {
    assertPositiveInt(props.durationMinutes);
    return Service._instantiate({
      id: props.id,
      name: props.name,
      category: new ServiceCategory(props.category),
      price: new Price(props.price),
      durationMinutes: props.durationMinutes,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }
};

// src/usecase/services/register-service/register-service.schema-validator.ts
import { z as z5 } from "zod";
var registerServiceSchema = z5.object({
  name: z5.string().min(1),
  category: z5.enum(["nails", "eyebrows"]),
  price: z5.number().nonnegative(),
  durationMinutes: z5.number().int().positive()
});

// src/usecase/services/register-service/register-service.usecase.ts
var RegisterServiceUseCase = class {
  serviceRepository;
  validationAdapter;
  constructor(serviceRepository, validationAdapter) {
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(inputDto) {
    const validatedInput = this.validationAdapter.validate(
      registerServiceSchema,
      inputDto
    );
    const alreadyExistsService = await this.serviceRepository.findByNameAndCategory(
      validatedInput.name,
      validatedInput.category
    );
    if (alreadyExistsService) {
      throw new ConflictError(
        `Service already registered: ${validatedInput.name} (${validatedInput.category})`
      );
    }
    const service = ServiceFactory.create({
      name: validatedInput.name,
      category: validatedInput.category,
      durationMinutes: validatedInput.durationMinutes,
      price: validatedInput.price
    });
    await this.serviceRepository.save(service);
    return {
      id: service.id,
      name: service.name,
      category: service.category.value,
      price: service.price.value,
      durationMinutes: service.durationMinutes,
      createdAt: service.createdAt.toISOString()
    };
  }
};

// src/infrastructure/repository/service.repository.ts
import { and, asc as asc2, eq as eq3 } from "drizzle-orm";
var ServiceRepository = class {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async findById(id) {
    const rows = await this.db.select().from(services).where(eq3(services.id, id)).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return ServiceFactory.reconstitute({
      id: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async findAll(params) {
    const rows = await this.db.select().from(services).orderBy(asc2(services.createdAt), asc2(services.id)).limit(params.limit).offset(params.offset);
    return rows.map(
      (row) => ServiceFactory.reconstitute({
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        durationMinutes: row.durationMinutes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
  }
  async findByNameAndCategory(name, category) {
    const rows = await this.db.select().from(services).where(and(eq3(services.name, name), eq3(services.category, category))).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return ServiceFactory.reconstitute({
      id: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async save(service) {
    await this.db.insert(services).values({
      id: service.id,
      name: service.name,
      category: service.category.value,
      price: service.price.value.toFixed(2),
      durationMinutes: service.durationMinutes,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    });
  }
  async update(service) {
    await this.db.update(services).set({
      name: service.name,
      category: service.category.value,
      price: service.price.value.toFixed(2),
      durationMinutes: service.durationMinutes,
      updatedAt: service.updatedAt
    }).where(eq3(services.id, service.id));
  }
  async delete(id) {
    await this.db.delete(services).where(eq3(services.id, id));
  }
};

// src/usecase/services/get-service/get-service.usecase.ts
var GetServiceUseCase = class {
  serviceRepository;
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }
  async execute(input) {
    const service = await this.serviceRepository.findById(input.id);
    if (!service) throw new EntityNotFoundError(`Service with id ${input.id} not found`);
    return {
      id: service.id,
      name: service.name,
      category: service.category.value,
      durationMinutes: service.durationMinutes,
      price: service.price.value,
      createdAt: service.createdAt.toISOString()
    };
  }
};

// src/usecase/services/get-services/get-services.usecase.ts
var DEFAULT_PAGE_SIZE2 = 20;
var MAX_PAGE_SIZE2 = 100;
var GetServicesUseCase = class {
  serviceRepository;
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }
  async execute(input) {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE2, MAX_PAGE_SIZE2);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const rows = await this.serviceRepository.findAll({ limit: first + 1, offset });
    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;
    const edges = items.map((service, index) => {
      const node = {
        id: service.id,
        name: service.name,
        category: service.category.value,
        price: service.price.value,
        durationMinutes: service.durationMinutes,
        createdAt: service.createdAt.toISOString()
      };
      return { node, cursor: encodeCursor(offset + index) };
    });
    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
      }
    };
  }
};

// src/usecase/services/update-service/update-service.schema-validator.ts
import z6 from "zod";
var updateServiceSchema = z6.object({
  id: z6.string().uuid(),
  name: z6.string().min(1).optional(),
  category: z6.enum(["nails", "eyebrows"]).optional(),
  price: z6.number().nonnegative().optional(),
  durationMinutes: z6.number().int().positive().optional()
});

// src/usecase/services/update-service/update-service.usecase.ts
var UpdateServiceUseCase = class {
  serviceRepository;
  validationAdapter;
  constructor(serviceRepository, validationAdapter) {
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(
      updateServiceSchema,
      input
    );
    const serviceFound = await this.serviceRepository.findById(validated.id);
    if (!serviceFound) throw new EntityNotFoundError(`Service with id ${validated.id} not found`);
    const newName = validated.name ?? serviceFound.name;
    const newCategory = validated.category ?? serviceFound.category.value;
    const nameAndCategoryChanged = newName !== serviceFound.name || newCategory !== serviceFound.category.value;
    if (nameAndCategoryChanged) {
      const existing = await this.serviceRepository.findByNameAndCategory(newName, newCategory);
      if (existing && existing.id !== serviceFound.id) {
        throw new ConflictError(`Service already registered: ${newName} (${newCategory})`);
      }
    }
    serviceFound.updateServiceDetails({
      name: validated.name,
      category: validated.category,
      price: validated.price,
      durationMinutes: validated.durationMinutes
    });
    await this.serviceRepository.update(serviceFound);
    return {
      id: serviceFound.id,
      name: serviceFound.name,
      category: serviceFound.category.value,
      price: serviceFound.price.value,
      durationMinutes: serviceFound.durationMinutes,
      createdAt: serviceFound.createdAt.toISOString()
    };
  }
};

// src/usecase/services/delete-service/delete-service.schema-validator.ts
import { z as z7 } from "zod";
var deleteServiceSchema = z7.object({
  id: z7.uuid()
});

// src/usecase/services/delete-service/delete-service.usecase.ts
var DeleteServiceUseCase = class {
  serviceRepository;
  validationAdapter;
  constructor(serviceRepository, validationAdapter) {
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(
      deleteServiceSchema,
      input
    );
    const service = await this.serviceRepository.findById(validated.id);
    if (!service) {
      throw new EntityNotFoundError(`Service with id ${validated.id} not found`);
    }
    await this.serviceRepository.delete(service.id);
    return { id: service.id };
  }
};

// src/domain/entity/schedule/factory/schedule.factory.ts
import { randomUUID as randomUUID3 } from "crypto";

// src/domain/@shared/value-object/schedule-status/schedule-status.vo.ts
var ALLOWED2 = /* @__PURE__ */ new Set([
  "pending",
  "confirmed",
  "completed",
  "cancelled"
]);
var ScheduleStatus = class extends ValueObject {
  constructor(value) {
    const normalised = value.trim().toLowerCase();
    if (!ALLOWED2.has(normalised)) {
      throw new InvalidValueError(`Invalid schedule status: ${value}`);
    }
    super(normalised);
  }
};

// src/domain/entity/schedule/schedule.entity.ts
var Schedule = class _Schedule extends Entity {
  _userId;
  _serviceId;
  _status;
  _date;
  _photoUrl;
  _tip;
  constructor(props) {
    super(props.id, props.createdAt, props.updatedAt);
    this._userId = props.userId;
    this._serviceId = props.serviceId;
    this._status = props.status;
    this._date = props.date;
    this._photoUrl = props.photoUrl;
    this._tip = props.tip;
  }
  static _instantiate(props) {
    return new _Schedule(props);
  }
  get userId() {
    return this._userId;
  }
  get serviceId() {
    return this._serviceId;
  }
  get status() {
    return this._status;
  }
  get date() {
    return this._date;
  }
  get photoUrl() {
    return this._photoUrl;
  }
  get tip() {
    return this._tip;
  }
  updateScheduleDetails(props) {
    if (props.status !== void 0) this._status = new ScheduleStatus(props.status);
    if (props.serviceId !== void 0) this._serviceId = props.serviceId;
    if (props.date !== void 0) {
      if (!(props.date instanceof Date) || !Number.isFinite(props.date.getTime())) {
        throw new InvalidValueError(`Invalid schedule date: ${String(props.date)}`);
      }
      this._date = props.date;
    }
    if (props.photoUrl !== void 0) this._photoUrl = props.photoUrl;
    this._updatedAt = /* @__PURE__ */ new Date();
  }
  applyTip(tip) {
    if (tip !== null && (!Number.isFinite(tip) || tip < 0)) {
      throw new InvalidValueError(`Invalid tip: ${String(tip)}`);
    }
    this._tip = tip;
    this._updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/domain/entity/schedule/factory/schedule.factory.ts
var assertValidDate = (date2) => {
  if (!(date2 instanceof Date) || !Number.isFinite(date2.getTime())) {
    throw new InvalidValueError(`Invalid schedule date: ${String(date2)}`);
  }
};
var ScheduleFactory = class {
  static create(props) {
    assertValidDate(props.date);
    const now = /* @__PURE__ */ new Date();
    return Schedule._instantiate({
      id: randomUUID3(),
      userId: props.userId,
      serviceId: props.serviceId,
      status: new ScheduleStatus(props.status ?? "pending"),
      date: props.date,
      photoUrl: props.photoUrl ?? null,
      tip: null,
      createdAt: now,
      updatedAt: now
    });
  }
  static reconstitute(props) {
    assertValidDate(props.date);
    return Schedule._instantiate({
      id: props.id,
      userId: props.userId,
      serviceId: props.serviceId,
      status: new ScheduleStatus(props.status),
      date: props.date,
      photoUrl: props.photoUrl,
      tip: props.tip,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }
};

// src/domain/service/schedule-conflict/schedule-conflict.service.ts
var ScheduleConflictService = class {
  static async hasConflict(start, durationMinutes, repo, excludeId) {
    const end = new Date(start.getTime() + durationMinutes * 6e4);
    const overlapping = await repo.findOverlapping(start, end, excludeId);
    return overlapping.length > 0;
  }
};

// src/usecase/schedule/register-schedule/register-schedule.schema-validator.ts
import { z as z8 } from "zod";
var registerScheduleSchema = z8.object({
  userId: z8.string().uuid(),
  serviceId: z8.string().uuid(),
  date: z8.date(),
  status: z8.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  photoUrl: z8.string().url().max(500).nullish()
});

// src/usecase/schedule/register-schedule/register-schedule.usecase.ts
var RegisterScheduleUseCase = class {
  scheduleRepository;
  userRepository;
  scheduleDiscountRepository;
  serviceRepository;
  validationAdapter;
  discountService;
  featureFlagProvider;
  constructor(scheduleRepository, userRepository, scheduleDiscountRepository, serviceRepository, validationAdapter, discountService, featureFlagProvider) {
    this.scheduleRepository = scheduleRepository;
    this.userRepository = userRepository;
    this.scheduleDiscountRepository = scheduleDiscountRepository;
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
    this.discountService = discountService;
    this.featureFlagProvider = featureFlagProvider;
  }
  async execute(input) {
    const validatedData = this.validationAdapter.validate(
      registerScheduleSchema,
      input
    );
    const user = await this.userRepository.findById(validatedData.userId);
    if (!user) throw new EntityNotFoundError(`User not found: ${validatedData.userId}`);
    const service = await this.serviceRepository.findById(validatedData.serviceId);
    if (!service) throw new EntityNotFoundError(`Service not found: ${validatedData.serviceId}`);
    const conflict = await ScheduleConflictService.hasConflict(
      validatedData.date,
      service.durationMinutes,
      this.scheduleRepository
    );
    if (conflict) {
      throw new ConflictError(`Time slot already booked: ${validatedData.date.toISOString()}`);
    }
    const schedule = ScheduleFactory.create({
      userId: validatedData.userId,
      serviceId: validatedData.serviceId,
      date: validatedData.date,
      status: validatedData.status,
      photoUrl: validatedData.photoUrl ?? null
    });
    await this.scheduleRepository.save(schedule);
    const enabled = /* @__PURE__ */ new Set();
    if (await this.featureFlagProvider.isEnabled("loyalty")) enabled.add("loyalty");
    if (await this.featureFlagProvider.isEnabled("birthday")) enabled.add("birthday");
    if (enabled.size > 0) {
      let loyaltyCompletedCount = 0;
      let loyaltyGrantedCount = 0;
      if (enabled.has("loyalty")) {
        [loyaltyCompletedCount, loyaltyGrantedCount] = await Promise.all([
          this.scheduleRepository.countCompletedForLoyalty(schedule.userId),
          this.scheduleDiscountRepository.countByUserAndReason(schedule.userId, "loyalty")
        ]);
      }
      const discount = this.discountService.resolveBest(
        {
          scheduleDate: schedule.date,
          birthDate: user.birthDate,
          loyaltyCompletedCount,
          loyaltyGrantedCount
        },
        enabled
      );
      if (discount) {
        await this.scheduleDiscountRepository.save({
          scheduleId: schedule.id,
          userId: schedule.userId,
          reason: discount.reason,
          percentage: discount.percentage
        });
      }
    }
    return {
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date.toISOString(),
      photoUrl: schedule.photoUrl,
      createdAt: schedule.createdAt.toISOString()
    };
  }
};

// src/infrastructure/repository/schedule.repository.ts
import { and as and2, sql, eq as eq4, asc as asc3, gte, lt, ne, notExists } from "drizzle-orm";
var ScheduleRepository = class {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async save(schedule) {
    await this.db.insert(schedules).values({
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date,
      photoUrl: schedule.photoUrl,
      tip: schedule.tip !== null ? schedule.tip.toString() : null,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    });
  }
  async findOverlapping(start, end, excludeId) {
    const conditions = [
      sql`${schedules.date} < ${end}`,
      sql`${schedules.date} + (${services.durationMinutes} * INTERVAL '1 minute') > ${start}`
    ];
    if (excludeId) {
      conditions.push(ne(schedules.id, excludeId));
    }
    const rows = await this.db.select({
      id: schedules.id,
      userId: schedules.userId,
      serviceId: schedules.serviceId,
      status: schedules.status,
      date: schedules.date,
      photoUrl: schedules.photoUrl,
      tip: schedules.tip,
      createdAt: schedules.createdAt,
      updatedAt: schedules.updatedAt,
      durationMinutes: services.durationMinutes
    }).from(schedules).innerJoin(services, eq4(schedules.serviceId, services.id)).where(and2(...conditions));
    return rows.map(
      (row) => ScheduleFactory.reconstitute({
        id: row.id,
        userId: row.userId,
        serviceId: row.serviceId,
        status: row.status,
        date: row.date,
        photoUrl: row.photoUrl,
        tip: row.tip !== null ? Number(row.tip) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
  }
  async findById(id) {
    const rows = await this.db.select().from(schedules).where(eq4(schedules.id, id)).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return ScheduleFactory.reconstitute({
      id: row.id,
      userId: row.userId,
      serviceId: row.serviceId,
      status: row.status,
      date: row.date,
      photoUrl: row.photoUrl,
      tip: row.tip !== null ? Number(row.tip) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async findAll(params) {
    const conditions = [];
    if (params.userId) conditions.push(eq4(schedules.userId, params.userId));
    if (params.status) conditions.push(eq4(schedules.status, params.status));
    const where = conditions.length > 0 ? and2(...conditions) : void 0;
    const rows = await this.db.select().from(schedules).where(where).orderBy(asc3(schedules.date), asc3(schedules.id)).limit(params.limit).offset(params.offset);
    return rows.map(
      (row) => ScheduleFactory.reconstitute({
        id: row.id,
        userId: row.userId,
        serviceId: row.serviceId,
        status: row.status,
        date: row.date,
        photoUrl: row.photoUrl,
        tip: row.tip !== null ? Number(row.tip) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
  }
  async findInRange(params) {
    const conditions = [gte(schedules.date, params.from), lt(schedules.date, params.to)];
    if (params.userId) conditions.push(eq4(schedules.userId, params.userId));
    if (params.status) conditions.push(eq4(schedules.status, params.status));
    const rows = await this.db.select().from(schedules).where(and2(...conditions)).orderBy(asc3(schedules.date), asc3(schedules.id));
    return rows.map(
      (row) => ScheduleFactory.reconstitute({
        id: row.id,
        userId: row.userId,
        serviceId: row.serviceId,
        status: row.status,
        date: row.date,
        photoUrl: row.photoUrl,
        tip: row.tip !== null ? Number(row.tip) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
  }
  async update(schedule) {
    await this.db.update(schedules).set({
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date,
      photoUrl: schedule.photoUrl,
      updatedAt: schedule.updatedAt
    }).where(eq4(schedules.id, schedule.id));
  }
  async delete(id) {
    await this.db.delete(schedules).where(eq4(schedules.id, id));
  }
  async complete(schedule, productIds) {
    await this.db.transaction(async (transaction) => {
      await transaction.update(schedules).set({
        status: schedule.status.value,
        updatedAt: schedule.updatedAt,
        tip: schedule.tip !== null ? schedule.tip.toString() : null
      }).where(eq4(schedules.id, schedule.id));
      if (productIds.length > 0) {
        await transaction.insert(scheduleProducts).values(productIds.map((productId) => ({ scheduleId: schedule.id, productId })));
      }
    });
  }
  async countCompletedForLoyalty(userId) {
    const queryScheduleFromScheduleDiscounts = this.db.select({ one: sql`1` }).from(scheduleDiscounts).where(
      and2(
        eq4(scheduleDiscounts.scheduleId, schedules.id),
        eq4(scheduleDiscounts.reason, "loyalty")
      )
    );
    const rows = await this.db.select({ count: sql`count(*)` }).from(schedules).where(
      and2(
        eq4(schedules.userId, userId),
        eq4(schedules.status, "completed"),
        notExists(queryScheduleFromScheduleDiscounts)
      )
    );
    const row = rows[0];
    return Number(row?.count ?? 0);
  }
};

// src/usecase/schedule/get-schedule/get-schedule.usecase.ts
var GetScheduleUseCase = class {
  scheduleRepository;
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }
  async execute(input) {
    const schedule = await this.scheduleRepository.findById(input.id);
    if (!schedule) throw new EntityNotFoundError(`Schedule with id ${input.id} not found`);
    return {
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date.toISOString(),
      photoUrl: schedule.photoUrl,
      tip: schedule.tip,
      createdAt: schedule.createdAt.toISOString()
    };
  }
};

// src/usecase/schedule/get-schedules/get-schedules.usecase.ts
var DEFAULT_PAGE_SIZE3 = 20;
var MAX_PAGE_SIZE3 = 100;
var GetSchedulesUseCase = class {
  scheduleRepository;
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }
  async execute(input) {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE3, MAX_PAGE_SIZE3);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const userId = input.filter?.userId ?? void 0;
    const status = input.filter?.status ?? void 0;
    const rows = await this.scheduleRepository.findAll({
      limit: first + 1,
      offset,
      userId,
      status
    });
    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;
    const edges = items.map((schedule, index) => {
      const node = {
        id: schedule.id,
        userId: schedule.userId,
        serviceId: schedule.serviceId,
        status: schedule.status.value,
        date: schedule.date.toISOString(),
        photoUrl: schedule.photoUrl,
        tip: schedule.tip,
        createdAt: schedule.createdAt.toISOString()
      };
      return { node, cursor: encodeCursor(offset + index) };
    });
    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
      }
    };
  }
};

// src/domain/service/schedule-range/schedule-range.service.ts
var WEEK_MS = 7 * 24 * 60 * 60 * 1e3;
var ScheduleRangeService = class {
  static computeRange(filter) {
    if (filter.weekStart) {
      const from = new Date(filter.weekStart.getTime());
      const to = new Date(from.getTime() + WEEK_MS);
      return { from, to };
    }
    if (filter.year !== void 0 && filter.month !== void 0) {
      const from = new Date(Date.UTC(filter.year, filter.month - 1, 1));
      const to = new Date(Date.UTC(filter.year, filter.month, 1));
      return { from, to };
    }
    if (filter.year !== void 0) {
      const from = new Date(Date.UTC(filter.year, 0, 1));
      const to = new Date(Date.UTC(filter.year + 1, 0, 1));
      return { from, to };
    }
    throw new InvalidValueError(
      "Invalid schedule range filter: provide weekStart, year+month, or year"
    );
  }
};

// src/usecase/schedule/get-schedules-in-range/get-schedules-in-range.schema-validator.ts
import { z as z9 } from "zod";
var MIN_YEAR = 1900;
var MAX_YEAR = 2100;
var getSchedulesInRangeSchema = z9.object({
  filter: z9.object({
    userId: z9.string().uuid().nullish(),
    year: z9.number().int().min(MIN_YEAR).max(MAX_YEAR).nullish(),
    month: z9.number().int().min(1).max(12).nullish(),
    weekStart: z9.coerce.date().nullish(),
    status: z9.enum(["pending", "confirmed", "completed", "cancelled"]).optional()
  }).refine(
    (f) => {
      const hasWeek = f.weekStart != null;
      const hasYear = f.year != null;
      const hasMonth = f.month != null;
      if (hasWeek && (hasYear || hasMonth)) return false;
      if (hasMonth && !hasYear) return false;
      if (!hasWeek && !hasYear) return false;
      return true;
    },
    {
      message: "Provide exactly one of: { weekStart }, { year, month }, or { year } (userId is optional and can combine with any mode)."
    }
  )
});

// src/usecase/schedule/get-schedules-in-range/get-schedules-in-range.usecase.ts
var GetSchedulesInRangeUseCase = class {
  scheduleRepository;
  validationAdapter;
  constructor(scheduleRepository, validationAdapter) {
    this.scheduleRepository = scheduleRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validatedData = this.validationAdapter.validate(
      getSchedulesInRangeSchema,
      input
    );
    const { from, to } = ScheduleRangeService.computeRange({
      year: validatedData.filter.year ?? void 0,
      month: validatedData.filter.month ?? void 0,
      weekStart: validatedData.filter.weekStart ?? void 0
    });
    const status = validatedData.filter.status ?? void 0;
    const rows = await this.scheduleRepository.findInRange({
      from,
      to,
      userId: validatedData.filter.userId ?? void 0,
      status
    });
    return rows.map((scheduleRow) => ({
      id: scheduleRow.id,
      userId: scheduleRow.userId,
      serviceId: scheduleRow.serviceId,
      status: scheduleRow.status.value,
      date: scheduleRow.date.toISOString(),
      photoUrl: scheduleRow.photoUrl,
      tip: scheduleRow.tip,
      createdAt: scheduleRow.createdAt.toISOString()
    }));
  }
};

// src/domain/service/schedule-status/schedule-status.service.ts
var TRANSICTIONS = {
  pending: /* @__PURE__ */ new Set(["confirmed", "cancelled"]),
  confirmed: /* @__PURE__ */ new Set(["completed", "cancelled"]),
  completed: /* @__PURE__ */ new Set(),
  cancelled: /* @__PURE__ */ new Set()
};
var ScheduleStatusService = class {
  static canTransition(from, to) {
    if (from === to) return true;
    return TRANSICTIONS[from].has(to);
  }
  static assertCanTransition(from, to) {
    if (!this.canTransition(from, to)) {
      throw new ConflictError(`Invalid schedule status transition: ${from} -> ${to}`);
    }
  }
};

// src/usecase/schedule/update-schedule/update-schedule.schema-validator.ts
import { z as z10 } from "zod";
var updateScheduleSchema = z10.object({
  id: z10.string().uuid(),
  status: z10.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]).optional(),
  date: z10.coerce.date().optional(),
  serviceId: z10.string().uuid().optional(),
  photoUrl: z10.string().url().max(500).nullish()
});

// src/usecase/schedule/update-schedule/update-schedule.usecase.ts
var UpdateScheduleUseCase = class {
  scheduleRepository;
  serviceRepository;
  validationAdapter;
  storageAdapter;
  constructor(scheduleRepository, serviceRepository, validationAdapter, storageAdapter) {
    this.scheduleRepository = scheduleRepository;
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
    this.storageAdapter = storageAdapter;
  }
  async execute(inputDto) {
    const validated = this.validationAdapter.validate(
      updateScheduleSchema,
      inputDto
    );
    const schedule = await this.scheduleRepository.findById(validated.id);
    if (!schedule) {
      throw new EntityNotFoundError(`Schedule not found: ${validated.id}`);
    }
    if (validated.status !== void 0 && validated.status !== schedule.status.value) {
      if (validated.status === "completed")
        throw new ConflictError(
          "Completing a schedule requires products; use the completeSchedule mutation"
        );
    }
    ScheduleStatusService.assertCanTransition(
      schedule.status.value,
      validated.status
    );
    const previousPhotoUrl = schedule.photoUrl;
    const nextServiceId = validated.serviceId ?? schedule.serviceId;
    const nextDate = validated.date ?? schedule.date;
    const timingChanged = validated.serviceId !== void 0 || validated.date !== void 0;
    if (timingChanged) {
      const service = await this.serviceRepository.findById(nextServiceId);
      if (!service) {
        throw new EntityNotFoundError(`Service not found: ${nextServiceId}`);
      }
      const conflict = await ScheduleConflictService.hasConflict(
        nextDate,
        service.durationMinutes,
        this.scheduleRepository,
        schedule.id
      );
      if (conflict) {
        throw new ConflictError(`Time slot already booked: ${nextDate.toISOString()}`);
      }
    }
    schedule.updateScheduleDetails({
      status: validated.status,
      date: validated.date,
      serviceId: validated.serviceId,
      photoUrl: validated.photoUrl
    });
    await this.scheduleRepository.update(schedule);
    if (validated.photoUrl !== void 0 && previousPhotoUrl !== null && previousPhotoUrl !== schedule.photoUrl) {
      await this.storageAdapter.delete(previousPhotoUrl);
    }
    return {
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date.toISOString(),
      photoUrl: schedule.photoUrl,
      tip: schedule.tip,
      createdAt: schedule.createdAt.toISOString()
    };
  }
};

// src/usecase/schedule/delete-schedule/delete-schedule.schema-validator.ts
import { z as z11 } from "zod";
var deleteScheduleSchema = z11.object({
  id: z11.uuid()
});

// src/usecase/schedule/delete-schedule/delete-schedule.usecase.ts
var DeleteScheduleUseCase = class {
  scheduleRepository;
  validationAdapter;
  constructor(scheduleRepository, validationAdapter) {
    this.scheduleRepository = scheduleRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(
      deleteScheduleSchema,
      input
    );
    const schedule = await this.scheduleRepository.findById(validated.id);
    if (!schedule) {
      throw new EntityNotFoundError(`Schedule with id ${validated.id} not found`);
    }
    await this.scheduleRepository.delete(schedule.id);
    return { id: schedule.id };
  }
};

// src/infrastructure/adapters/local-storage.adapter.ts
import { dirname, join } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
var LocalStorageAdapter = class {
  config;
  constructor(config) {
    this.config = config;
  }
  async upload(params) {
    const destination = join(this.config.assetsDir, params.key);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, params.body);
    const base = this.config.publicBaseUrl.replace(/\/$/, "");
    return { url: `${base}/${params.key}` };
  }
  async delete(url) {
    const base = this.config.publicBaseUrl.replace(/\/$/, "");
    if (!url.startsWith(`${base}/`)) {
      return;
    }
    const key = url.slice(base.length + 1);
    const target = join(this.config.assetsDir, key);
    try {
      await unlink(target);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
};

// src/usecase/schedule/upload-photo/upload-photo.usecase.ts
import { randomUUID as randomUUID4 } from "crypto";
import { fileTypeFromBuffer } from "file-type";

// src/usecase/schedule/upload-photo/upload-photo.schema-validator.ts
import { z as z12 } from "zod";
var uploadPhotoSchema = z12.object({
  filename: z12.string().min(1)
});

// src/usecase/schedule/upload-photo/upload-photo.usecase.ts
var MAX_BYTES = 5 * 1024 * 1024;
var UploadPhotoUseCase = class {
  storageAdapter;
  validationAdapter;
  constructor(storageAdapter, validationAdapter) {
    this.storageAdapter = storageAdapter;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    this.validationAdapter.validate(uploadPhotoSchema, {
      filename: input.filename,
      mimetype: input.mimetype
    });
    if (input.buffer.byteLength === 0) {
      throw new InvalidValueError("Uploaded file is empty");
    }
    if (input.buffer.byteLength > MAX_BYTES) {
      throw new InvalidValueError("Uploaded file exceeds the 5MB limit");
    }
    const detected = await fileTypeFromBuffer(input.buffer);
    if (!detected || !detected.mime.startsWith("image/"))
      throw new InvalidValueError("Only image uploads are allowed");
    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `schedules/photos/${randomUUID4()}-${safeName}`;
    const { url } = await this.storageAdapter.upload({
      key,
      body: input.buffer,
      contentType: input.mimetype
    });
    return { url };
  }
};

// src/infrastructure/repository/product.repository.ts
import { and as and3, asc as asc4, eq as eq5, inArray as inArray6 } from "drizzle-orm";

// src/domain/entity/product/factory/product.factory.ts
import { randomUUID as randomUUID5 } from "crypto";

// src/domain/entity/product/product.entity.ts
var Product = class _Product extends Entity {
  _name;
  _brand;
  _color;
  _category;
  _isAvailable;
  constructor(props) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._brand = props.brand;
    this._color = props.color;
    this._category = props.category;
    this._isAvailable = props.isAvailable;
  }
  static _instantiate(props) {
    return new _Product(props);
  }
  get name() {
    return this._name;
  }
  get brand() {
    return this._brand;
  }
  get color() {
    return this._color;
  }
  get category() {
    return this._category;
  }
  get isAvailable() {
    return this._isAvailable;
  }
  updateProductDetails(props) {
    if (props.name !== void 0) {
      if (props.name.trim().length === 0) {
        throw new InvalidValueError("Product name cannot be empty");
      }
      this._name = props.name;
    }
    if (props.brand !== void 0) {
      if (props.brand.trim().length === 0) {
        throw new InvalidValueError("Product brand cannot be empty");
      }
      this._brand = props.brand;
    }
    if (props.color !== void 0) this._color = props.color;
    if (props.category !== void 0) this._category = new ServiceCategory(props.category);
    if (props.isAvailable !== void 0) this._isAvailable = props.isAvailable;
    this._updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/domain/entity/product/factory/product.factory.ts
var assertNonEmptyName = (name) => {
  if (name.trim().length === 0) {
    throw new InvalidValueError("Product name cannot be empty");
  }
};
var ProductFactory = class {
  static create(props) {
    assertNonEmptyName(props.name);
    const now = /* @__PURE__ */ new Date();
    return Product._instantiate({
      id: randomUUID5(),
      name: props.name,
      brand: props.brand,
      category: new ServiceCategory(props.category),
      color: props.color ?? null,
      isAvailable: props.isAvailable ?? true,
      createdAt: now,
      updatedAt: now
    });
  }
  static reconstitute(props) {
    assertNonEmptyName(props.name);
    return Product._instantiate({
      id: props.id,
      name: props.name,
      brand: props.brand,
      category: new ServiceCategory(props.category),
      color: props.color,
      isAvailable: props.isAvailable,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }
};

// src/infrastructure/repository/product.repository.ts
var ProductRepository = class {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async findByNameAndBrand(name, brand) {
    const rows = await this.db.select().from(products).where(and3(eq5(products.name, name), eq5(products.brand, brand))).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return ProductFactory.reconstitute({
      id: row.id,
      name: row.name,
      brand: row.brand,
      category: row.category,
      color: row.color,
      isAvailable: row.isAvailable,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async findById(id) {
    const rows = await this.db.select().from(products).where(eq5(products.id, id)).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return ProductFactory.reconstitute({
      id: row.id,
      name: row.name,
      brand: row.brand,
      category: row.category,
      color: row.color,
      isAvailable: row.isAvailable,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  async findByIds(ids) {
    if (ids.length === 0) return [];
    const rows = await this.db.select().from(products).where(inArray6(products.id, ids));
    return rows.map(
      (row) => ProductFactory.reconstitute({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        color: row.color,
        isAvailable: row.isAvailable,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
  }
  async findAll(params) {
    const rows = await this.db.select().from(products).orderBy(asc4(products.createdAt), asc4(products.id)).limit(params.limit).offset(params.offset);
    return rows.map(
      (row) => ProductFactory.reconstitute({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        color: row.color,
        isAvailable: row.isAvailable,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    );
  }
  async save(product) {
    await this.db.insert(products).values({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category.value,
      color: product.color,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    });
  }
  async update(product) {
    await this.db.update(products).set({
      name: product.name,
      brand: product.brand,
      category: product.category.value,
      color: product.color,
      isAvailable: product.isAvailable,
      updatedAt: product.updatedAt
    }).where(eq5(products.id, product.id));
  }
  async delete(id) {
    await this.db.delete(products).where(eq5(products.id, id));
  }
};

// src/usecase/products/register-product/register-product.schema-validator.ts
import { z as z13 } from "zod";
var registerProductSchema = z13.object({
  name: z13.string().min(1),
  brand: z13.string().min(1),
  category: z13.enum(["nails", "eyebrows"]),
  color: z13.string().min(1).nullish(),
  isAvailable: z13.boolean().optional()
});

// src/usecase/products/register-product/register-product.usecase.ts
var RegisterProductUseCase = class {
  productRepository;
  validationAdapter;
  constructor(productRepository, validationAdapter) {
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(inputDto) {
    const validatedInput = this.validationAdapter.validate(
      registerProductSchema,
      inputDto
    );
    const alreadyExistsProduct = await this.productRepository.findByNameAndBrand(
      validatedInput.name,
      validatedInput.brand
    );
    if (alreadyExistsProduct) {
      throw new ConflictError(
        `Product already registered: ${validatedInput.name} (${validatedInput.brand})`
      );
    }
    const product = ProductFactory.create({
      name: validatedInput.name,
      brand: validatedInput.brand,
      category: validatedInput.category,
      color: validatedInput.color ?? null,
      isAvailable: validatedInput.isAvailable
    });
    await this.productRepository.save(product);
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category.value,
      color: product.color,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt.toISOString()
    };
  }
};

// src/usecase/products/get-product/get-product.usecase.ts
var GetProductUseCase = class {
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(input) {
    const product = await this.productRepository.findById(input.id);
    if (!product) throw new EntityNotFoundError(`Product with id ${input.id} not found`);
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category.value,
      color: product.color,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt.toISOString()
    };
  }
};

// src/usecase/products/get-products/get-products.usecase.ts
var DEFAULT_PAGE_SIZE4 = 20;
var MAX_PAGE_SIZE4 = 100;
var GetProductsUseCase = class {
  productRepository;
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  async execute(input) {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE4, MAX_PAGE_SIZE4);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const rows = await this.productRepository.findAll({ limit: first + 1, offset });
    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;
    const edges = items.map((product, index) => {
      const node = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category.value,
        color: product.color,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt.toISOString()
      };
      return { node, cursor: encodeCursor(offset + index) };
    });
    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
      }
    };
  }
};

// src/usecase/products/update-product/update-product.schema-validator.ts
import z14 from "zod";
var updateProductSchema = z14.object({
  id: z14.string().uuid(),
  name: z14.string().min(1).optional(),
  brand: z14.string().min(1).optional(),
  category: z14.enum(["nails", "eyebrows"]).optional(),
  color: z14.string().min(1).optional(),
  isAvailable: z14.boolean().optional()
});

// src/usecase/products/update-product/update-product.usecase.ts
var UpdateProductUseCase = class {
  productRepository;
  validationAdapter;
  constructor(productRepository, validationAdapter) {
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(
      updateProductSchema,
      input
    );
    const productFound = await this.productRepository.findById(validated.id);
    if (!productFound) {
      throw new EntityNotFoundError(`Product with id ${validated.id} not found`);
    }
    const newName = validated.name ?? productFound.name;
    const newBrand = validated.brand ?? productFound.brand;
    const nameOrBrandChanged = newName !== productFound.name || newBrand !== productFound.brand;
    if (nameOrBrandChanged) {
      const existing = await this.productRepository.findByNameAndBrand(newName, newBrand);
      if (existing && existing.id !== productFound.id) {
        throw new ConflictError(`Product already registered: ${newName} (${newBrand})`);
      }
    }
    productFound.updateProductDetails({
      name: validated.name,
      brand: validated.brand,
      color: validated.color,
      category: validated.category,
      isAvailable: validated.isAvailable
    });
    await this.productRepository.update(productFound);
    return {
      id: productFound.id,
      name: productFound.name,
      brand: productFound.brand,
      category: productFound.category.value,
      color: productFound.color,
      isAvailable: productFound.isAvailable,
      createdAt: productFound.createdAt.toISOString()
    };
  }
};

// src/usecase/products/delete-product/delete-product.schema-validator.ts
import { z as z15 } from "zod";
var deleteProductSchema = z15.object({
  id: z15.uuid()
});

// src/usecase/products/delete-product/delete-product.usecase.ts
var DeleteProductUseCase = class {
  productRepository;
  validationAdapter;
  constructor(productRepository, validationAdapter) {
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(
      deleteProductSchema,
      input
    );
    const product = await this.productRepository.findById(validated.id);
    if (!product) {
      throw new EntityNotFoundError(`Product with id ${validated.id} not found`);
    }
    await this.productRepository.delete(product.id);
    return { id: product.id };
  }
};

// src/usecase/schedule/complete-schedule/complete-schedule.schema-validator.ts
import { z as z16 } from "zod";
var completeScheduleSchema = z16.object({
  scheduleId: z16.string().uuid(),
  productIds: z16.array(z16.string().uuid()).min(1),
  tip: z16.number().nonnegative().nullish()
});

// src/usecase/schedule/complete-schedule/complete-schedule.usecase.ts
var CompleteScheduleUseCase = class {
  scheduleRepository;
  serviceRepository;
  productRepository;
  validationAdapter;
  constructor(scheduleRepository, serviceRepository, productRepository, validationAdapter) {
    this.scheduleRepository = scheduleRepository;
    this.serviceRepository = serviceRepository;
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }
  async execute(input) {
    const validated = this.validationAdapter.validate(
      completeScheduleSchema,
      input
    );
    const schedule = await this.scheduleRepository.findById(validated.scheduleId);
    if (!schedule) throw new EntityNotFoundError(`Schedule not found: ${validated.scheduleId}`);
    ScheduleStatusService.assertCanTransition(schedule.status.value, "completed");
    const service = await this.serviceRepository.findById(schedule.serviceId);
    if (!service) {
      throw new EntityNotFoundError(`Service not found: ${schedule.serviceId}`);
    }
    const uniqueIds = [...new Set(validated.productIds)];
    const products2 = await this.productRepository.findByIds(uniqueIds);
    if (products2.length !== uniqueIds.length) {
      throw new EntityNotFoundError(`Product not found in: ${uniqueIds.join(", ")}`);
    }
    const serviceCategory = service.category.value;
    for (const product of products2) {
      if (product.category.value !== serviceCategory) {
        throw new InvalidValueError(
          `Product ${product.id} (${product.category.value}) does not match service category ${serviceCategory}`
        );
      }
    }
    schedule.updateScheduleDetails({ status: "completed" });
    schedule.applyTip(validated.tip ?? null);
    await this.scheduleRepository.complete(schedule, uniqueIds);
    return {
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date.toISOString(),
      photoUrl: schedule.photoUrl,
      tip: schedule.tip,
      createdAt: schedule.createdAt.toISOString()
    };
  }
};

// src/infrastructure/repository/schedule-discount.repository.ts
import { and as and4, eq as eq6, sql as sql2 } from "drizzle-orm";
var ScheduleDiscountRepository = class {
  constructor(db2) {
    this.db = db2;
  }
  async save(input) {
    await this.db.insert(scheduleDiscounts).values({
      scheduleId: input.scheduleId,
      userId: input.userId,
      reason: input.reason,
      percentage: input.percentage.toString()
      // numeric column expects string
    });
  }
  async countByUserAndReason(userId, reason) {
    const rows = await this.db.select({ count: sql2`count(*)` }).from(scheduleDiscounts).where(and4(eq6(scheduleDiscounts.userId, userId), eq6(scheduleDiscounts.reason, reason)));
    const row = rows[0];
    return Number(row?.count ?? 0);
  }
};

// src/domain/service/discount/rules/birthday-discount.rule.ts
var BIRTHDAY_PERCENTAGE = 10;
var BirthdayDiscountRule = class {
  reason = "birthday";
  evaluate(ctx) {
    if (ctx.birthDate !== null && ctx.scheduleDate.getUTCMonth() === ctx.birthDate.getUTCMonth()) {
      return { reason: "birthday", percentage: BIRTHDAY_PERCENTAGE };
    }
    return null;
  }
};

// src/domain/service/discount/rules/loyalty-discount.rule.ts
var LOYALTY_COMPLETED_PER_CYCLE = 9;
var LOYALTY_PERCENTAGE = 30;
var LoyaltyDiscountRule = class {
  reason = "loyalty";
  evaluate(context) {
    if (Math.floor(context.loyaltyCompletedCount / LOYALTY_COMPLETED_PER_CYCLE) > context.loyaltyGrantedCount) {
      return {
        reason: "loyalty",
        percentage: LOYALTY_PERCENTAGE
      };
    }
    return null;
  }
};

// src/domain/service/discount/discount.service.ts
var DiscountService = class {
  rules;
  constructor(rules = [new LoyaltyDiscountRule(), new BirthdayDiscountRule()]) {
    this.rules = rules;
  }
  resolveBest(context, enabled) {
    const candidates = this.rules.filter((rule) => enabled.has(rule.reason)).map((rule) => rule.evaluate(context)).filter((discount) => discount !== null);
    if (candidates.length === 0) return null;
    return candidates.reduce(
      (bestValue, currentValue) => currentValue.percentage > bestValue.percentage ? currentValue : bestValue
    );
  }
};

// src/infrastructure/adapters/feature-flag.adapter.ts
import { readFile } from "fs/promises";
var JsonFileFeatureFlagProvider = class {
  constructor(filePath) {
    this.filePath = filePath;
  }
  async isEnabled(key) {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const flags = JSON.parse(raw);
      return flags[key] === true;
    } catch {
      return false;
    }
  }
};

// src/infrastructure/container.ts
var pool = new Pool({ connectionString: DATABASE_URL });
var db = drizzle(pool);
var buildRegisterUserUseCase = () => {
  const userRepository = new UserRepository(db);
  const hashAdapter = new BcryptAdapter();
  const validationAdapter = new ZodAdapter();
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    hashAdapter,
    validationAdapter
  );
  return registerUserUseCase;
};
var buildGetUsersUseCase = () => {
  const userRepository = new UserRepository(db);
  const getUsersUseCase = new GetUsersUseCase(userRepository);
  return getUsersUseCase;
};
var buildGetUserUseCase = () => {
  const userRepository = new UserRepository(db);
  const getUserUseCase = new GetUserUseCase(userRepository);
  return getUserUseCase;
};
var buildJwtAdapter = () => {
  return new JwtAdapter(JWT_SECRET);
};
var buildLoginUseCase = () => {
  const userRepository = new UserRepository(db);
  const hashAdapter = new BcryptAdapter();
  const jwtAdapter = new JwtAdapter(JWT_SECRET);
  const validationAdapter = new ZodAdapter();
  const loginUseCase = new LoginUseCase(userRepository, hashAdapter, jwtAdapter, validationAdapter);
  return loginUseCase;
};
var buildLogoutUseCase = () => {
  const logoutUseCase = new LogoutUseCase();
  return logoutUseCase;
};
var buildUpdateUserUseCase = () => {
  const userRepository = new UserRepository(db);
  const validationAdapter = new ZodAdapter();
  const updateUserUseCase = new UpdateUserUseCase(userRepository, validationAdapter);
  return updateUserUseCase;
};
var buildDeleteUserUseCase = () => {
  const userRepository = new UserRepository(db);
  const validationAdapter = new ZodAdapter();
  const deleteUserUseCase = new DeleteUserUseCase(userRepository, validationAdapter);
  return deleteUserUseCase;
};
var buildRegisterServiceUseCase = () => {
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();
  const registerServiceUseCase = new RegisterServiceUseCase(serviceRepository, validationAdapter);
  return registerServiceUseCase;
};
var buildGetServiceUseCase = () => {
  const serviceRepository = new ServiceRepository(db);
  const getServiceUseCase = new GetServiceUseCase(serviceRepository);
  return getServiceUseCase;
};
var buildGetServicesUseCase = () => {
  const serviceRepository = new ServiceRepository(db);
  const getServicesUseCase = new GetServicesUseCase(serviceRepository);
  return getServicesUseCase;
};
var buildUpdateServiceUseCase = () => {
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();
  const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository, validationAdapter);
  return updateServiceUseCase;
};
var buildDeleteServiceUseCase = () => {
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();
  const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository, validationAdapter);
  return deleteServiceUseCase;
};
var buildRegisterScheduleUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  const userRepository = new UserRepository(db);
  const scheduleDiscountRepository = new ScheduleDiscountRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();
  const discountService = new DiscountService();
  const featureFlagProvider = new JsonFileFeatureFlagProvider(FEATURE_FLAGS_PATH);
  return new RegisterScheduleUseCase(
    scheduleRepository,
    userRepository,
    scheduleDiscountRepository,
    serviceRepository,
    validationAdapter,
    discountService,
    featureFlagProvider
  );
};
var buildGetScheduleUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  return new GetScheduleUseCase(scheduleRepository);
};
var buildGetSchedulesUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  return new GetSchedulesUseCase(scheduleRepository);
};
var buildGetSchedulesInRangeUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  const validationAdapter = new ZodAdapter();
  return new GetSchedulesInRangeUseCase(scheduleRepository, validationAdapter);
};
var buildUpdateScheduleUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();
  const storageAdapter = new LocalStorageAdapter({
    assetsDir: ASSETS_DIR,
    publicBaseUrl: `${PUBLIC_BASE_URL.replace(/\/$/, "")}/assets`
  });
  return new UpdateScheduleUseCase(
    scheduleRepository,
    serviceRepository,
    validationAdapter,
    storageAdapter
  );
};
var buildDeleteScheduleUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  const validationAdapter = new ZodAdapter();
  return new DeleteScheduleUseCase(scheduleRepository, validationAdapter);
};
var buildUploadPhotoUseCase = () => {
  const storageAdapter = new LocalStorageAdapter({
    assetsDir: ASSETS_DIR,
    publicBaseUrl: `${PUBLIC_BASE_URL.replace(/\/$/, "")}/assets`
  });
  const validationAdapter = new ZodAdapter();
  return new UploadPhotoUseCase(storageAdapter, validationAdapter);
};
var buildRegisterProductUseCase = () => {
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();
  const registerProductUseCase = new RegisterProductUseCase(productRepository, validationAdapter);
  return registerProductUseCase;
};
var buildGetProductUseCase = () => {
  const productRepository = new ProductRepository(db);
  return new GetProductUseCase(productRepository);
};
var buildGetProductsUseCase = () => {
  const productRepository = new ProductRepository(db);
  return new GetProductsUseCase(productRepository);
};
var buildUpdateProductUseCase = () => {
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();
  return new UpdateProductUseCase(productRepository, validationAdapter);
};
var buildDeleteProductUseCase = () => {
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();
  return new DeleteProductUseCase(productRepository, validationAdapter);
};
var buildCompleteScheduleUseCase = () => {
  const scheduleRepository = new ScheduleRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();
  return new CompleteScheduleUseCase(
    scheduleRepository,
    serviceRepository,
    productRepository,
    validationAdapter
  );
};

// src/infrastructure/graphql/plugins/require-auth/require-auth.plugin.ts
import { GraphQLError as GraphQLError23 } from "graphql";

// src/infrastructure/graphql/plugins/public-operations.ts
var PUBLIC_OPERATIONS = /* @__PURE__ */ new Set([
  "login",
  "registerUser",
  "__schema",
  "__type",
  "__typename"
]);

// src/infrastructure/graphql/plugins/require-auth/require-auth.plugin.ts
function topLevelFieldNames(operation) {
  return operation.selectionSet.selections.filter((selection) => selection.kind === "Field").map((field) => field.name.value);
}
function requiresAuth(operation) {
  return topLevelFieldNames(operation).some((name) => !PUBLIC_OPERATIONS.has(name));
}
function requireAuthPlugin() {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ operation, contextValue }) {
          if (!operation) return;
          if (!requiresAuth(operation)) return;
          if (contextValue.currentUser) return;
          throw new GraphQLError23("You must be authenticated to perform this operation", {
            extensions: { code: "UNAUTHENTICATED" }
          });
        }
      };
    }
  };
}

// src/infrastructure/api/config/server.ts
var MAX_BYTES2 = 5 * 1024 * 1024;
async function startServer() {
  const jwtAdapter = buildJwtAdapter();
  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers27,
    plugins: [requireAuthPlugin()]
  });
  await server.start();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/assets", express.static(ASSETS_DIR));
  app.use(
    "/graphql",
    graphqlUploadExpress({ maxFileSize: MAX_BYTES2, maxFiles: 1 }),
    expressMiddleware(server, {
      context: buildContext(
        {
          login: buildLoginUseCase(),
          logout: buildLogoutUseCase(),
          registerUser: buildRegisterUserUseCase(),
          getUsers: buildGetUsersUseCase(),
          getUser: buildGetUserUseCase(),
          updateUser: buildUpdateUserUseCase(),
          deleteUser: buildDeleteUserUseCase(),
          registerService: buildRegisterServiceUseCase(),
          getService: buildGetServiceUseCase(),
          getServices: buildGetServicesUseCase(),
          updateService: buildUpdateServiceUseCase(),
          deleteService: buildDeleteServiceUseCase(),
          registerSchedule: buildRegisterScheduleUseCase(),
          getSchedule: buildGetScheduleUseCase(),
          getSchedules: buildGetSchedulesUseCase(),
          getSchedulesInRange: buildGetSchedulesInRangeUseCase(),
          updateSchedule: buildUpdateScheduleUseCase(),
          deleteSchedule: buildDeleteScheduleUseCase(),
          uploadPhoto: buildUploadPhotoUseCase(),
          registerProduct: buildRegisterProductUseCase(),
          getProduct: buildGetProductUseCase(),
          getProducts: buildGetProductsUseCase(),
          updateProduct: buildUpdateProductUseCase(),
          deleteProduct: buildDeleteProductUseCase(),
          completeSchedule: buildCompleteScheduleUseCase()
        },
        db,
        jwtAdapter
      )
    })
  );
  app.listen(PORT, () => {
    console.log(`RF-Studio is running at http://localhost:${PORT}/graphql`);
  });
}

// src/main.ts
startServer().catch((error) => {
  console.log("[Error starting server]: ", error);
  process.exit(1);
});
//# sourceMappingURL=main.js.map