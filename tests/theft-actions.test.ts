import type { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "./db";

/**
 * Exercises the real theft server actions against an in-memory Postgres.
 *
 * The existing suites test the schema (constraints, indexes); this one tests
 * the code paths around it — above all the authorization boundary, which is
 * the part of a public registry that actually has to hold: only the owner of
 * a bike may report it stolen, publish that report, or take it down.
 *
 * `@/db`, `@/lib/session` and `next/navigation` are mocked. The navigation
 * mocks throw, which is what the real ones do: `redirect()` and `notFound()`
 * never return, so the action's code after them must not run.
 */

const mocks = vi.hoisted(() => {
  const state: {
    // biome-ignore lint/suspicious/noExplicitAny: drizzle's db type is internal to the mock
    db: any;
    userId: string | null;
  } = { db: null, userId: null };

  return {
    state,
    nav: {
      redirect: (url: string) => {
        throw new Error(`REDIRECT:${url}`);
      },
      notFound: () => {
        throw new Error("NOT_FOUND");
      },
    },
  };
});

// A proxy, because the real database only exists once beforeAll has run,
// while the mock factory is hoisted above it.
vi.mock("@/db", () => ({
  db: new Proxy(
    {},
    {
      get(_target, prop) {
        const value = mocks.state.db[prop];
        return typeof value === "function" ? value.bind(mocks.state.db) : value;
      },
    },
  ),
}));

vi.mock("@/lib/session", () => ({
  getSession: async () =>
    mocks.state.userId ? { user: { id: mocks.state.userId } } : null,
}));

vi.mock("next/navigation", () => mocks.nav);

const { reportTheft, publishTheft, markTheftRecovered, withdrawTheft } =
  await import("@/app/bikes/[id]/theft/actions");

let pg: PGlite;

/** Signed in as the owner of bike `b1` unless a test says otherwise. */
const OWNER = "u1";
const STRANGER = "u2";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

/** A valid report, so each test only has to vary the field it cares about. */
function validReport(overrides: Record<string, string> = {}) {
  return form({ stolenOn: "2026-01-15", ...overrides });
}

async function theftRows() {
  const { rows } = await pg.query<{
    id: string;
    status: string;
    published_at: Date | null;
    deleted_at: Date | null;
    stolen_on: string | null;
    location: string | null;
    description: string | null;
    contact: string | null;
    contact_public: boolean;
    // Cast: PGlite hands a `date` column back as a Date, while the column is
    // declared `mode: "string"` in the schema, so compare it as written.
  }>("select *, stolen_on::text as stolen_on from theft order by created_at");
  return rows;
}

/** Asserts the action redirected rather than returning a form error. */
async function expectRedirect(promise: Promise<unknown>, to: string) {
  await expect(promise).rejects.toThrow(`REDIRECT:${to}`);
}

beforeAll(async () => {
  pg = await createTestDb();
  mocks.state.db = drizzle(pg);
  await pg.exec(
    `insert into "user" (id, name, email, email_verified, created_at, updated_at)
     values ('u2', 'Stranger', 's@example.com', true, now(), now())`,
  );
});

beforeEach(async () => {
  await pg.exec("delete from theft; delete from bicycle");
  await pg.exec(
    `insert into bicycle (id, user_id, make, serial_number)
     values ('b1', 'u1', 'Trek', 'SN1')`,
  );
  mocks.state.userId = OWNER;
});

describe("reportTheft", () => {
  it("files an unpublished, active report", async () => {
    await expectRedirect(
      reportTheft("b1", validReport({ location: "Tallinn" })),
      "/bikes/b1",
    );

    const [report] = await theftRows();
    expect(report).toMatchObject({
      status: "active",
      published_at: null,
      deleted_at: null,
      stolen_on: "2026-01-15",
      location: "Tallinn",
      contact_public: false,
    });
  });

  it("publishes immediately when the owner ticks publish", async () => {
    await expectRedirect(
      reportTheft("b1", validReport({ publish: "on" })),
      "/bikes/b1",
    );

    const [report] = await theftRows();
    expect(report.published_at).toBeInstanceOf(Date);
  });

  it("records the contact opt-in when a contact is given", async () => {
    await expectRedirect(
      reportTheft(
        "b1",
        validReport({ contact: "owner@example.com", contactPublic: "on" }),
      ),
      "/bikes/b1",
    );

    const [report] = await theftRows();
    expect(report).toMatchObject({
      contact: "owner@example.com",
      contact_public: true,
    });
  });

  it("ignores the contact opt-in when there is no contact to show", async () => {
    await expectRedirect(
      reportTheft("b1", validReport({ contactPublic: "on" })),
      "/bikes/b1",
    );

    const [report] = await theftRows();
    expect(report).toMatchObject({ contact: null, contact_public: false });
  });

  it("blanks whitespace-only optional fields rather than storing them", async () => {
    await expectRedirect(
      reportTheft(
        "b1",
        validReport({ location: "   ", description: "", contact: "  " }),
      ),
      "/bikes/b1",
    );

    const [report] = await theftRows();
    expect(report).toMatchObject({
      location: null,
      description: null,
      contact: null,
    });
  });

  it("returns a form error, and files nothing, when the date is missing", async () => {
    const result = await reportTheft("b1", form({ location: "Tallinn" }));

    expect(result).toEqual({
      error: "Enter the date the bike was stolen.",
    });
    expect(await theftRows()).toHaveLength(0);
  });

  it("returns a form error when the date is in the future", async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10);

    const result = await reportTheft("b1", form({ stolenOn: future }));

    expect(result).toEqual({ error: "The theft date can't be in the future." });
    expect(await theftRows()).toHaveLength(0);
  });

  // The DB index is what actually prevents this; the action has to turn the
  // raw constraint violation into something the owner can read.
  it("explains the duplicate instead of throwing a constraint error", async () => {
    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");

    const result = await reportTheft("b1", validReport());

    expect(result).toEqual({
      error: "This bike already has an open theft report.",
    });
    expect(await theftRows()).toHaveLength(1);
  });

  it("lets the owner file again once the first report is recovered", async () => {
    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");
    await expectRedirect(markTheftRecovered("b1"), "/bikes/b1");

    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");
    expect(await theftRows()).toHaveLength(2);
  });
});

describe("publishTheft", () => {
  it("publishes an unpublished report", async () => {
    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");

    await expectRedirect(publishTheft("b1"), "/bikes/b1");

    const [report] = await theftRows();
    expect(report.published_at).toBeInstanceOf(Date);
  });

  it("keeps the original publication date when published twice", async () => {
    await expectRedirect(
      reportTheft("b1", validReport({ publish: "on" })),
      "/bikes/b1",
    );
    const [first] = await theftRows();

    await expectRedirect(publishTheft("b1"), "/bikes/b1");

    const [second] = await theftRows();
    expect(second.published_at).toEqual(first.published_at);
  });

  it("404s when the bike has no open report", async () => {
    await expect(publishTheft("b1")).rejects.toThrow("NOT_FOUND");
  });

  it("404s when the only report has been withdrawn", async () => {
    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");
    await expectRedirect(withdrawTheft("b1"), "/bikes/b1");

    await expect(publishTheft("b1")).rejects.toThrow("NOT_FOUND");
  });
});

describe("markTheftRecovered", () => {
  it("closes the report without deleting it", async () => {
    await expectRedirect(
      reportTheft("b1", validReport({ publish: "on" })),
      "/bikes/b1",
    );

    await expectRedirect(markTheftRecovered("b1"), "/bikes/b1");

    const [report] = await theftRows();
    expect(report).toMatchObject({ status: "recovered", deleted_at: null });
    // Still published: the report happened, it is simply no longer open.
    expect(report.published_at).toBeInstanceOf(Date);
  });
});

describe("withdrawTheft", () => {
  // Soft delete, so a withdrawn report is still there for dispute handling.
  it("soft-deletes the report and leaves its status alone", async () => {
    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");

    await expectRedirect(withdrawTheft("b1"), "/bikes/b1");

    const [report] = await theftRows();
    expect(report.deleted_at).toBeInstanceOf(Date);
    expect(report.status).toBe("active");
  });

  it("frees the bike for a new report", async () => {
    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");
    await expectRedirect(withdrawTheft("b1"), "/bikes/b1");

    await expectRedirect(reportTheft("b1", validReport()), "/bikes/b1");
    expect(await theftRows()).toHaveLength(2);
  });
});

// The part that has to hold. Someone else's bike is not yours to report
// stolen, publish, recover, or withdraw.
describe("authorization", () => {
  beforeEach(async () => {
    await pg.exec(
      `insert into theft (id, bicycle_id, status) values ('t-owned', 'b1', 'active')`,
    );
  });

  it.each([
    ["reportTheft", () => reportTheft("b1", validReport())],
    ["publishTheft", () => publishTheft("b1")],
    ["markTheftRecovered", () => markTheftRecovered("b1")],
    ["withdrawTheft", () => withdrawTheft("b1")],
  ])("%s 404s for a signed-in stranger", async (_name, call) => {
    mocks.state.userId = STRANGER;

    await expect(call()).rejects.toThrow("NOT_FOUND");
  });

  it.each([
    ["reportTheft", () => reportTheft("b1", validReport())],
    ["publishTheft", () => publishTheft("b1")],
    ["markTheftRecovered", () => markTheftRecovered("b1")],
    ["withdrawTheft", () => withdrawTheft("b1")],
  ])("%s sends a signed-out visitor home", async (_name, call) => {
    mocks.state.userId = null;

    await expect(call()).rejects.toThrow("REDIRECT:/");
  });

  it.each([
    ["publishTheft", () => publishTheft("missing")],
    ["markTheftRecovered", () => markTheftRecovered("missing")],
    ["withdrawTheft", () => withdrawTheft("missing")],
  ])("%s 404s for a bike that does not exist", async (_name, call) => {
    await expect(call()).rejects.toThrow("NOT_FOUND");
  });

  it("404s for a soft-deleted bike", async () => {
    await pg.exec("update bicycle set deleted_at = now() where id = 'b1'");

    await expect(publishTheft("b1")).rejects.toThrow("NOT_FOUND");
  });

  it("leaves the stranger's attempt with no effect on the report", async () => {
    mocks.state.userId = STRANGER;

    await expect(withdrawTheft("b1")).rejects.toThrow("NOT_FOUND");

    const [report] = await theftRows();
    expect(report).toMatchObject({ status: "active", deleted_at: null });
  });
});
