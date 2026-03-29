// src/main.ts
import "dotenv/config";

// src/infrastructure/api/config/server.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";

// src/infrastructure/graphql/schema/error.graphql.ts
var errorTypeDefs = `#graphql
  type UserAlreadyExistsError {
    message: string
  }
`;

// src/infrastructure/graphql/schema/user.graphql.ts
var userTypeDefs = `#graphql
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

    type Mutation {
        registerUser(input: RegisterUserInput!): RegisterUserPayload!
    }
`;

// src/infrastructure/graphql/schema/schema.ts
var typeDefs = [errorTypeDefs, userTypeDefs];

// src/infrastructure/graphql/resolvers/mutations/user.mutation.ts
import { GraphQLError } from "graphql";

// src/domain/@shared/errors/conflictError.ts
var ConflictError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
};

// src/domain/@shared/errors/invalidValueError.ts
var InvalidValueError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidValueError";
  }
};

// src/infrastructure/graphql/resolvers/mutations/user.mutation.ts
var userMutations = {
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
          throw new GraphQLError(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw error;
      }
    }
  }
};

// src/infrastructure/graphql/resolvers/index.ts
var resolvers = {
  ...userMutations
};

// src/infrastructure/graphql/buildContext.ts
function buildContext(useCases) {
  return async ({ req }) => ({
    useCases
  });
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
import { eq } from "drizzle-orm";

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
};

// src/infrastructure/adapters/bcrypt.adapter.ts
import bcrypt from "bcryptjs";
var BcryptAdapter = class {
  saltRounds = 10;
  async hash(plain) {
    return bcrypt.hash(plain, this.saltRounds);
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

// src/domain/@shared/errors/entityNotFoundError.ts
var EntityNotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "EntityNotFoundError";
  }
};

// src/usecase/register-user/register-user.schema-validator.ts
import { z } from "zod";
var registerUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(9),
  birthDate: z.string().nullable().optional()
});

// src/usecase/register-user/register-user.usecase.ts
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

// src/infrastructure/api/config/server.ts
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: buildContext({ registerUser: buildRegisterUserUseCase() })
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