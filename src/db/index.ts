import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { requireEnv } from "@/lib/env";

config({ path: ".env" }); // or .env.local

export const db = drizzle(requireEnv("DATABASE_URL"));
