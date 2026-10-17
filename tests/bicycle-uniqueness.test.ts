import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./db";

let pg: PGlite;
let n = 0;

beforeAll(async () => {
  pg = await createTestDb();
});

beforeEach(async () => {
  await pg.exec("delete from bicycle");
});

function addBike(make: string, model: string | null, serial: string) {
  return pg.query(
    `insert into bicycle (id, user_id, make, model, serial_number)
     values ($1, 'u1', $2, $3, $4)`,
    [`b${++n}`, make, model, serial],
  );
}

describe("bicycle (serial, make, model) uniqueness", () => {
  it("rejects the exact same bike", async () => {
    await addBike("Trek", "FX", "SN123");
    await expect(addBike("Trek", "FX", "SN123")).rejects.toThrow(
      /bicycle_serial_make_model_idx/,
    );
  });

  it("ignores case and surrounding whitespace", async () => {
    await addBike("Trek", "FX", "SN123");
    await expect(addBike("  trek ", "fx", " sn123 ")).rejects.toThrow(
      /bicycle_serial_make_model_idx/,
    );
  });

  it("treats a missing model as empty, so two modelless rows collide", async () => {
    await addBike("Trek", null, "SN123");
    await expect(addBike("Trek", null, "SN123")).rejects.toThrow(
      /bicycle_serial_make_model_idx/,
    );
  });

  it("allows the same serial under a different make or model", async () => {
    await addBike("Trek", "FX", "SN123");
    await addBike("Giant", "FX", "SN123");
    await addBike("Trek", "Domane", "SN123");
  });

  it("frees the serial once the registration is soft-deleted", async () => {
    await addBike("Trek", "FX", "SN123");
    await pg.exec(`update bicycle set deleted_at = now()`);
    await addBike("Trek", "FX", "SN123");
  });
});
