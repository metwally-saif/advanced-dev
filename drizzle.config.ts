import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://neondb_owner:npg_5udLiGJ6CEQe@ep-flat-union-a29y4lgl-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
});
