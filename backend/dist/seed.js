// src/infrastructure/db/seeders/index.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/infrastructure/db/schema/roles.schema.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
var roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

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

// src/infrastructure/db/seeders/index.ts
var pool = new Pool({ connectionString: DATABASE_URL });
var db = drizzle(pool);
async function seed() {
  console.log("Seeding Roles to Database ...");
  await db.insert(roles).values([{ name: "manager" }, { name: "client" }]).onConflictDoNothing();
  console.log("Done.");
  await pool.end();
}
seed().catch((error) => {
  console.log("[Error during seeding]: ", error);
  process.exit(1);
});
//# sourceMappingURL=seed.js.map