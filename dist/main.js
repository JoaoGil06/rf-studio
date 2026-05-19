// src/main.ts
import "dotenv/config";

// src/infrastructure/api/config/server.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
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

// src/infrastructure/graphql/schema/typedefs/service.graphql.ts
var serviceTypeDefs = `#graphql
    type Query {
        service(id: ID!): Service!
        services(first: Int, after: String): ServiceConnection!
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
var typeDefs = [errorTypeDefs, paginationTypeDefs, userTypeDefs, serviceTypeDefs];

// src/infrastructure/graphql/resolvers/index.ts
import { mergeResolvers as mergeResolvers10 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/queries/index.ts
import { mergeResolvers as mergeResolvers3 } from "@graphql-tools/merge";

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

// src/infrastructure/graphql/resolvers/queries/index.ts
var queryResolvers = mergeResolvers3([userQueryResolvers, serviceQueryResolvers]);

// src/infrastructure/graphql/resolvers/mutations/index.ts
import { mergeResolvers as mergeResolvers7 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/user/index.ts
import { mergeResolvers as mergeResolvers4 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/user/registerUser.mutation.ts
import { GraphQLError as GraphQLError3 } from "graphql";

// src/domain/@shared/errors/conflictError.ts
var ConflictError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/registerUser.mutation.ts
var resolvers5 = {
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
          throw new GraphQLError3(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/updateUser.mutation.ts
import { GraphQLError as GraphQLError4 } from "graphql";
var resolvers6 = {
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
          throw new GraphQLError4(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/deleteUser.mutation.ts
import { GraphQLError as GraphQLError5 } from "graphql";
var resolvers7 = {
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
          throw new GraphQLError5(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/user/index.ts
var userMutationResolvers = mergeResolvers4([resolvers5, resolvers6, resolvers7]);

// src/infrastructure/graphql/resolvers/mutations/auth/index.ts
import { mergeResolvers as mergeResolvers5 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/auth/login.mutation.ts
import { GraphQLError as GraphQLError6 } from "graphql";

// src/domain/@shared/errors/unathorizedError.ts
var UnathorizedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UnathorizedError";
  }
};

// src/infrastructure/graphql/resolvers/mutations/auth/login.mutation.ts
var resolvers8 = {
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
          throw new GraphQLError6(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/auth/logout.mutation.ts
var resolvers9 = {
  Mutation: {
    logout: async (_, __, context) => {
      return context.useCases.logout.execute();
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/auth/index.ts
var authMutationResolvers = mergeResolvers5([resolvers8, resolvers9]);

// src/infrastructure/graphql/resolvers/mutations/service/index.ts
import { mergeResolvers as mergeResolvers6 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/mutations/service/registerService.mutation.ts
import { GraphQLError as GraphQLError7 } from "graphql";
var resolvers10 = {
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
          throw new GraphQLError7(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/mutations/service/index.ts
var serviceMutationResolvers = mergeResolvers6([resolvers10]);

// src/infrastructure/graphql/resolvers/mutations/index.ts
var mutationResolvers = mergeResolvers7([
  userMutationResolvers,
  authMutationResolvers,
  serviceMutationResolvers
]);

// src/infrastructure/graphql/resolvers/field_resolvers/index.ts
import { mergeResolvers as mergeResolvers9 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/field_resolvers/user/index.ts
import { mergeResolvers as mergeResolvers8 } from "@graphql-tools/merge";

// src/infrastructure/graphql/resolvers/field_resolvers/user/User.fields.ts
var resolvers11 = {
  User: {
    role: async (parent, _, context) => {
      return context.dataLoaders.role.load(parent.roleId);
    }
  }
};

// src/infrastructure/graphql/resolvers/field_resolvers/user/index.ts
var userTypeResolvers = mergeResolvers8([resolvers11]);

// src/infrastructure/graphql/resolvers/field_resolvers/index.ts
var fieldResolvers = mergeResolvers9([userTypeResolvers]);

// src/infrastructure/graphql/resolvers/index.ts
var resolvers12 = mergeResolvers10([queryResolvers, mutationResolvers, fieldResolvers]);

// src/infrastructure/graphql/helpers/extract-berarer-token.ts
function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

// src/infrastructure/graphql/buildContext.ts
function buildContext(useCases, dataLoaders, jwtAdapter) {
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
      dataLoaders
    };
  };
}

// src/infrastructure/container.ts
import { Pool } from "pg";

// src/infrastructure/constants/env.ts
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

// src/infrastructure/container.ts
import { drizzle } from "drizzle-orm/node-postgres";

// src/infrastructure/db/schema/users.schema.ts
import { pgTable as pgTable2, uuid as uuid2, varchar as varchar2, timestamp as timestamp2, date } from "drizzle-orm/pg-core";

// src/infrastructure/db/schema/roles.schema.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
var roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// src/infrastructure/db/schema/users.schema.ts
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

// src/infrastructure/repository/user.repository.ts
import { asc, eq } from "drizzle-orm";

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
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
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
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
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
    const rows = await this.db.select().from(roles).where(eq(roles.name, name)).limit(1);
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
    }).where(eq(users.id, user.id));
  }
  async delete(id) {
    await this.db.delete(users).where(eq(users.id, id));
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

// src/infrastructure/graphql/dataloaders/role/role.dataloader.ts
import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
function createRoleDataLoader(db2) {
  return new DataLoader(async (ids) => {
    const rows = await db2.select({ id: roles.id, name: roles.name }).from(roles).where(inArray(roles.id, [...ids]));
    const hashMap = new Map(rows.map((row) => [row.id, row]));
    console.log("[Hash Map]: ", hashMap);
    return ids.map((id) => hashMap.get(id) ?? null);
  });
}

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
};

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

// src/infrastructure/db/schema/services.schema.ts
import { pgTable as pgTable3, uuid as uuid3, varchar as varchar3, decimal, integer, timestamp as timestamp3 } from "drizzle-orm/pg-core";
var services = pgTable3("services", {
  id: uuid3("id").primaryKey().defaultRandom(),
  name: varchar3("name", { length: 100 }).notNull(),
  category: varchar3("category", { length: 20 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow()
});

// src/infrastructure/repository/service.repository.ts
import { and, asc as asc2, eq as eq2 } from "drizzle-orm";
var ServiceRepository = class {
  db;
  constructor(db2) {
    this.db = db2;
  }
  async findById(id) {
    const rows = await this.db.select().from(services).where(eq2(services.id, id)).limit(1);
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
    const rows = await this.db.select().from(services).where(and(eq2(services.name, name), eq2(services.category, category))).limit(1);
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
var buildRoleDataLoader = () => {
  const roleDataLoader = createRoleDataLoader(db);
  return roleDataLoader;
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

// src/infrastructure/graphql/plugins/require-auth/require-auth.plugin.ts
import { GraphQLError as GraphQLError8 } from "graphql";

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
          throw new GraphQLError8("You must be authenticated to perform this operation", {
            extensions: { code: "UNAUTHENTICATED" }
          });
        }
      };
    }
  };
}

// src/infrastructure/api/config/server.ts
async function startServer() {
  const jwtAdapter = buildJwtAdapter();
  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers12,
    plugins: [requireAuthPlugin()]
  });
  await server.start();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    "/graphql",
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
          getServices: buildGetServicesUseCase()
        },
        {
          role: buildRoleDataLoader()
        },
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