import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",

  dbCredentials: {
    url: process.env.DATABASE_URL,
    user: "root",
    password: "root",
  },

  verbose: true,
  // Locally, confirm every push statement. In CI (the "DB push" GitHub
  // Action) nobody can answer the prompt, so the workflow's manual trigger
  // and confirm input stand in for it.
  strict: !process.env.CI,
  dialect: "postgresql",
});
