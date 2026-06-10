/// <reference types="vite/client" />
//
// convex-test suite for the double opt-in subscriber flow. This is the one
// sanctioned exception to the "no test files in convex/" rule: convex-test is
// the supported pattern for this directory, and the Convex CLI excludes
// *.test.ts files from analysis, so `convex dev` pushes cleanly around it.
//
// Runs in the edge-runtime vitest environment (see environmentMatchGlobs in
// vitest.config.mts), which matches the Convex isolate far better than jsdom.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { convexTest, type TestConvex } from "convex-test";
import rateLimiter from "@convex-dev/rate-limiter/test";
import schema from "./schema";
import { api, internal } from "./_generated/api";

// Everything convex-test should know about, minus declaration/test files.
const modules = import.meta.glob("./**/!(*.*.*)*.*s");

/**
 * Fresh backend per test, with the rate-limiter component registered —
 * `subscribe` calls into it on every request, so convex-test must host the
 * component's own functions/tables alongside ours.
 */
function setup() {
  const t = convexTest(schema, modules);
  rateLimiter.register(t);
  return t;
}

type T = ReturnType<typeof setup>;

/** All subscriber rows, for asserting on writes. */
async function allSubscribers(t: T) {
  return t.run((ctx) => ctx.db.query("subscribers").collect());
}

/** Scheduled functions whose name mentions `needle` (e.g. "sendConfirmation"). */
async function scheduledCalls(t: T, needle: string) {
  const fns = await t.run((ctx) =>
    ctx.db.system.query("_scheduled_functions").collect(),
  );
  return fns.filter((f) => f.name.includes(needle));
}

const VALID_ARGS = { email: "reader@example.com", source: "hero", elapsedMs: 4000 };

describe("subscribers.subscribe", () => {
  // Fake timers keep runAfter(0)-scheduled email actions from actually
  // executing mid-test — we assert on the schedule, not the send.
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("inserts a pending, tokenless row and schedules the confirmation email", async () => {
    const t = setup();
    const res = await t.mutation(api.subscribers.subscribe, {
      ...VALID_ARGS,
      email: "Reader@Example.COM ",
    });
    expect(res).toEqual({ ok: true });

    const rows = await allSubscribers(t);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "reader@example.com", // trimmed + lowercased
      source: "hero",
      status: "pending",
    });
    // The token is generated later, by the sendConfirmation Node action.
    expect(rows[0].confirmToken).toBeUndefined();
    expect(rows[0].tokenExpiry).toBeUndefined();

    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(1);
  });

  it("collapses an unknown source to \"unknown\"", async () => {
    const t = setup();
    await t.mutation(api.subscribers.subscribe, {
      ...VALID_ARGS,
      source: "<script>alert(1)</script>",
    });
    const rows = await allSubscribers(t);
    expect(rows[0].source).toBe("unknown");
  });

  it("returns opaque { ok: true } and writes nothing when the honeypot is filled", async () => {
    const t = setup();
    const res = await t.mutation(api.subscribers.subscribe, {
      ...VALID_ARGS,
      hp: "spambot inc",
    });
    expect(res).toEqual({ ok: true });
    expect(await allSubscribers(t)).toHaveLength(0);
    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(0);
  });

  it("returns opaque { ok: true } and writes nothing on a too-fast submit", async () => {
    const t = setup();
    const res = await t.mutation(api.subscribers.subscribe, {
      ...VALID_ARGS,
      elapsedMs: 200,
    });
    expect(res).toEqual({ ok: true });
    expect(await allSubscribers(t)).toHaveLength(0);
  });

  it("rejects an invalid email (after the spam gates, so bots see real validation)", async () => {
    const t = setup();
    await expect(
      t.mutation(api.subscribers.subscribe, { ...VALID_ARGS, email: "not-an-email" }),
    ).rejects.toThrow(/invalid email/);
    expect(await allSubscribers(t)).toHaveLength(0);
  });

  it("dedupes a confirmed subscriber opaquely: { ok: true }, no new row, no email", async () => {
    const t = setup();
    await t.run(async (ctx) => {
      await ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "confirmed",
      });
    });

    const res = await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(res).toEqual({ ok: true });

    const rows = await allSubscribers(t);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("confirmed");
    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(0);
  });

  it("treats a legacy row (status undefined) as confirmed for dedup", async () => {
    const t = setup();
    await t.run(async (ctx) => {
      await ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
      });
    });

    const res = await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(res).toEqual({ ok: true });
    expect(await allSubscribers(t)).toHaveLength(1);
    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(0);
  });

  it("allows an unsubscribed address to re-subscribe: resets to pending and schedules confirmation", async () => {
    const t = setup();
    const id = await t.run(async (ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "unsubscribed",
      }),
    );

    const res = await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(res).toEqual({ ok: true });

    // Still only one row — no duplicate inserted.
    const rows = await allSubscribers(t);
    expect(rows).toHaveLength(1);
    expect(rows[0]._id).toBe(id);
    expect(rows[0].status).toBe("pending");
    expect(rows[0].confirmToken).toBeUndefined();
    expect(rows[0].tokenExpiry).toBeUndefined();

    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(1);
  });

  it("returns opaque { ok: true } without inserting once the per-email rate limit trips", async () => {
    const t = setup();

    // subscribePerEmail has capacity 5. Burn all five tokens, deleting the
    // created row each time so the dedup path can't mask the limiter.
    for (let i = 0; i < 5; i++) {
      const res = await t.mutation(api.subscribers.subscribe, VALID_ARGS);
      expect(res).toEqual({ ok: true });
      await t.run(async (ctx) => {
        for (const row of await ctx.db.query("subscribers").collect()) {
          await ctx.db.delete(row._id);
        }
      });
    }

    // Sixth call: bucket empty (fake timers — no refill). Opaque ok, no write.
    const res = await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(res).toEqual({ ok: true });
    expect(await allSubscribers(t)).toHaveLength(0);
  });

  it("cooldown-limits confirmation re-sends for a pending re-subscribe", async () => {
    const t = setup();

    // First subscribe: insert + confirmation email #1.
    await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(1);

    // Re-subscribe while pending: confirmResendPerEmail (capacity 1) allows
    // exactly one re-send...
    await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(2);

    // ...and the next attempt inside the cooldown schedules nothing, while
    // still answering an opaque { ok: true }.
    const res = await t.mutation(api.subscribers.subscribe, VALID_ARGS);
    expect(res).toEqual({ ok: true });
    expect(await scheduledCalls(t, "sendConfirmation")).toHaveLength(2);

    // Never a second row.
    expect(await allSubscribers(t)).toHaveLength(1);
  });
});

describe("subscribers.setConfirmationToken", () => {
  it("patches token + expiry onto a still-pending row", async () => {
    const t = setup();
    const id = await t.run((ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "pending",
      }),
    );

    const expiry = Date.now() + 1000;
    await t.mutation(internal.subscribers.setConfirmationToken, {
      subscriberId: id,
      token: "tok-123",
      tokenExpiry: expiry,
    });

    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.confirmToken).toBe("tok-123");
    expect(row?.tokenExpiry).toBe(expiry);
  });

  it("leaves a row alone if it confirmed between schedule and send", async () => {
    const t = setup();
    const id = await t.run((ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "confirmed",
      }),
    );

    await t.mutation(internal.subscribers.setConfirmationToken, {
      subscriberId: id,
      token: "tok-123",
      tokenExpiry: Date.now() + 1000,
    });

    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.status).toBe("confirmed");
    expect(row?.confirmToken).toBeUndefined();
    expect(row?.tokenExpiry).toBeUndefined();
  });

  it("is a no-op (not an error) for a deleted subscriber", async () => {
    const t = setup();
    const id = await t.run(async (ctx) => {
      const id = await ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "pending",
      });
      await ctx.db.delete(id);
      return id;
    });

    // Convex serializes a void return as null — the point is it resolves.
    await expect(
      t.mutation(internal.subscribers.setConfirmationToken, {
        subscriberId: id,
        token: "tok-123",
        tokenExpiry: Date.now() + 1000,
      }),
    ).resolves.toBeNull();
  });
});

describe("subscribers.confirm", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function insertPending(t: T, token?: string, tokenExpiry?: number) {
    return t.run((ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "pending",
        confirmToken: token,
        tokenExpiry,
      }),
    );
  }

  it("confirms a valid token: flips status, clears the token, schedules the welcome", async () => {
    const t = setup();
    const id = await insertPending(t, "valid-token", Date.now() + 60_000);

    const res = await t.mutation(api.subscribers.confirm, { token: "valid-token" });
    expect(res).toEqual({ ok: true });

    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.status).toBe("confirmed");
    expect(row?.confirmToken).toBeUndefined();
    expect(row?.tokenExpiry).toBeUndefined();

    expect(await scheduledCalls(t, "sendWelcome")).toHaveLength(1);
  });

  it("rejects an expired token and leaves the row pending", async () => {
    const t = setup();
    const id = await insertPending(t, "stale-token", Date.now() - 1);

    const res = await t.mutation(api.subscribers.confirm, { token: "stale-token" });
    expect(res).toEqual({ ok: false, reason: "expired" });

    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.status).toBe("pending");
    expect(await scheduledCalls(t, "sendWelcome")).toHaveLength(0);
  });

  it("treats a token with no recorded expiry as expired", async () => {
    const t = setup();
    await insertPending(t, "no-expiry-token", undefined);

    const res = await t.mutation(api.subscribers.confirm, { token: "no-expiry-token" });
    expect(res).toEqual({ ok: false, reason: "expired" });
  });

  it("rejects a garbage token as invalid", async () => {
    const t = setup();
    await insertPending(t, "real-token", Date.now() + 60_000);

    const res = await t.mutation(api.subscribers.confirm, { token: "never-issued" });
    expect(res).toEqual({ ok: false, reason: "invalid" });
    expect(await scheduledCalls(t, "sendWelcome")).toHaveLength(0);
  });

  it("rejects a blank token as invalid without touching tokenless rows", async () => {
    const t = setup();
    await insertPending(t); // pending, no token — must not match ""

    const res = await t.mutation(api.subscribers.confirm, { token: "  " });
    expect(res).toEqual({ ok: false, reason: "invalid" });

    const rows = await allSubscribers(t);
    expect(rows[0].status).toBe("pending");
  });
});

describe("subscribers.recordUnsubscribe", () => {
  it("sets an existing confirmed subscriber to unsubscribed and clears token fields", async () => {
    const t = setup();
    const id = await t.run((ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "confirmed",
      }),
    );

    await t.mutation(internal.subscribers.recordUnsubscribe, {
      email: "reader@example.com",
    });

    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.status).toBe("unsubscribed");
    expect(row?.confirmToken).toBeUndefined();
    expect(row?.tokenExpiry).toBeUndefined();
  });

  it("marks a pending subscriber as unsubscribed and clears any token", async () => {
    const t = setup();
    const id = await t.run((ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "pending",
        confirmToken: "tok-abc",
        tokenExpiry: Date.now() + 60_000,
      }),
    );

    await t.mutation(internal.subscribers.recordUnsubscribe, {
      email: "reader@example.com",
    });

    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.status).toBe("unsubscribed");
    expect(row?.confirmToken).toBeUndefined();
    expect(row?.tokenExpiry).toBeUndefined();
  });

  it("is idempotent when already unsubscribed", async () => {
    const t = setup();
    await t.run((ctx) =>
      ctx.db.insert("subscribers", {
        email: "reader@example.com",
        createdAt: Date.now(),
        source: "hero",
        status: "unsubscribed",
      }),
    );

    // Should not throw and state stays unsubscribed.
    await t.mutation(internal.subscribers.recordUnsubscribe, {
      email: "reader@example.com",
    });

    const rows = await allSubscribers(t);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("unsubscribed");
  });

  it("is a no-op (not an error) for an unknown email", async () => {
    const t = setup();

    await expect(
      t.mutation(internal.subscribers.recordUnsubscribe, {
        email: "ghost@example.com",
      }),
    ).resolves.toBeNull();

    expect(await allSubscribers(t)).toHaveLength(0);
  });
});

describe("maintenance.purgeExpiredPending", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const DAY = 24 * 60 * 60 * 1000;

  it("purges expired-token and stale tokenless pendings; keeps the rest", async () => {
    const t = setup();
    const now = Date.now();

    await t.run(async (ctx) => {
      // token issued but expired → purged
      await ctx.db.insert("subscribers", {
        email: "expired-token@example.com",
        createdAt: now - 8 * DAY,
        source: "hero",
        status: "pending",
        confirmToken: "tok-expired",
        tokenExpiry: now - 1,
      });
      // token still valid → kept
      await ctx.db.insert("subscribers", {
        email: "fresh-token@example.com",
        createdAt: now - DAY,
        source: "hero",
        status: "pending",
        confirmToken: "tok-fresh",
        tokenExpiry: now + 6 * DAY,
      });
      // tokenless but recent (send may still be in flight) → kept
      await ctx.db.insert("subscribers", {
        email: "fresh-tokenless@example.com",
        createdAt: now - DAY,
        source: "hero",
        status: "pending",
      });
      // tokenless and older than 8 days (send failed permanently) → purged
      await ctx.db.insert("subscribers", {
        email: "stale-tokenless@example.com",
        createdAt: now - 9 * DAY,
        source: "hero",
        status: "pending",
      });
      // confirmed rows are never candidates, however old → kept
      await ctx.db.insert("subscribers", {
        email: "confirmed@example.com",
        createdAt: now - 30 * DAY,
        source: "hero",
        status: "confirmed",
      });
    });

    await t.mutation(internal.maintenance.purgeExpiredPending, {});

    const emails = (await allSubscribers(t)).map((r) => r.email).sort();
    expect(emails).toEqual([
      "confirmed@example.com",
      "fresh-token@example.com",
      "fresh-tokenless@example.com",
    ]);
  });

  it("drains a backlog larger than one batch by rescheduling itself", async () => {
    const t = setup();
    const now = Date.now();

    await t.run(async (ctx) => {
      for (let i = 0; i < 101; i++) {
        await ctx.db.insert("subscribers", {
          email: `pending-${i}@example.com`,
          createdAt: now - 9 * DAY,
          source: "hero",
          status: "pending",
        });
      }
    });

    await t.mutation(internal.maintenance.purgeExpiredPending, {});

    // One full batch deleted, the straggler still there...
    expect(await allSubscribers(t)).toHaveLength(1);
    // ...and a follow-up purge scheduled to finish the job.
    expect(await scheduledCalls(t, "purgeExpiredPending")).toHaveLength(1);
  });
});
