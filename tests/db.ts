import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS = join(__dirname, "../src/db/migrations");

/** In-memory Postgres with every committed migration applied. */
export async function createTestDb() {
  const pg = new PGlite();
  const files = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS, file), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      if (statement.trim()) await pg.exec(statement);
    }
  }
  await pg.exec(
    `insert into "user" (id, name, email, email_verified, created_at, updated_at) values ('u1', 'Test', 't@example.com', true, now(), now())`,
  );
  return pg;
}
