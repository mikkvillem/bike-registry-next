import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./db";

let pg: PGlite;
let n = 0;

beforeAll(async () => {
  pg = await createTestDb();
});

beforeEach(async () => {
  await pg.exec("delete from theft; delete from bicycle");
  await pg.exec(
    `insert into bicycle (id, user_id, make, serial_number) values ('b1', 'u1', 'Trek', 'SN1')`,
  );
});

function addTheft(status = "active") {
  return pg.query(
    `insert into theft (id, bicycle_id, status) values ($1, 'b1', $2)`,
    [`t${++n}`, status],
  );
}

describe("theft reports", () => {
  it("defaults to an unpublished, active report with private contact", async () => {
    await addTheft();
    const { rows } = await pg.query<{
      status: string;
      published_at: Date | null;
      contact_public: boolean;
    }>(`select status, published_at, contact_public from theft`);
    expect(rows[0]).toEqual({
      status: "active",
      published_at: null,
      contact_public: false,
    });
  });

  it("allows only one open report per bike", async () => {
    await addTheft();
    await expect(addTheft()).rejects.toThrow(/theft_bicycle_active_idx/);
  });

  it("allows a new report after the previous one is recovered", async () => {
    await addTheft();
    await pg.exec(`update theft set status = 'recovered'`);
    await addTheft();
  });

  it("allows a new report after the previous one is withdrawn", async () => {
    await addTheft();
    await pg.exec(`update theft set deleted_at = now()`);
    await addTheft();
  });

  it("rejects unknown statuses", async () => {
    await expect(addTheft("pending")).rejects.toThrow();
  });
});
