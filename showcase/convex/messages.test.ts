/// <reference types="vite/client" />
//
// convex-test suite for the contact-form gateway hardening (P3-9). Same
// sanctioned exception as subscribers.test.ts: the Convex CLI excludes
// *.test.ts from analysis, and this runs in the edge-runtime vitest
// environment (environmentMatchGlobs in vitest.config.mts).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { convexTest } from "convex-test";
import rateLimiter from "@convex-dev/rate-limiter/test";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/!(*.*.*)*.*s");

function setup() {
  const t = convexTest(schema, modules);
  rateLimiter.register(t);
  return t;
}

type T = ReturnType<typeof setup>;

async function allMessages(t: T) {
  return t.run((ctx) => ctx.db.query("messages").collect());
}

const VALID_ARGS = {
  email: "reader@example.com",
  message: "a heartfelt note",
  source: "contact-h8",
  elapsedMs: 4000,
};

// Pin the gateway secret to "unset" by default (fail-open); individual suites
// stub their own value. See subscribers.test.ts for the rationale.
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("CONVEX_SHARED_SECRET", "");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("messages.submitContact gateway secret (P3-9)", () => {
  beforeEach(() => vi.stubEnv("CONVEX_SHARED_SECRET", "test-gateway-secret"));

  it("no-ops opaquely when the secret is missing", async () => {
    const t = setup();
    const res = await t.mutation(api.messages.submitContact, VALID_ARGS);
    expect(res).toEqual({ ok: true });
    expect(await allMessages(t)).toHaveLength(0);
  });

  it("no-ops opaquely when the secret is wrong", async () => {
    const t = setup();
    const res = await t.mutation(api.messages.submitContact, {
      ...VALID_ARGS,
      secret: "not-the-secret",
    });
    expect(res).toEqual({ ok: true });
    expect(await allMessages(t)).toHaveLength(0);
  });

  it("writes normally when the correct secret is supplied", async () => {
    const t = setup();
    const res = await t.mutation(api.messages.submitContact, {
      ...VALID_ARGS,
      secret: "test-gateway-secret",
    });
    expect(res).toEqual({ ok: true });
    const rows = await allMessages(t);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "reader@example.com",
      message: "a heartfelt note",
      source: "contact-h8",
    });
  });

  it("fails open (still writes) when CONVEX_SHARED_SECRET is unset", async () => {
    vi.stubEnv("CONVEX_SHARED_SECRET", "");
    const t = setup();
    const res = await t.mutation(api.messages.submitContact, VALID_ARGS);
    expect(res).toEqual({ ok: true });
    expect(await allMessages(t)).toHaveLength(1);
  });
});

describe("messages.submitContact per-IP rate limit (P3-9)", () => {
  it("opaquely drops further submissions from one ipHash once the bucket is empty", async () => {
    const t = setup();
    const ipHash = "a".repeat(64);

    // contactPerIp has capacity 8. Distinct emails + messages keep the
    // per-email bucket and dup suppression out of the way; fake timers mean
    // no refill.
    for (let i = 0; i < 8; i++) {
      const res = await t.mutation(api.messages.submitContact, {
        ...VALID_ARGS,
        email: `reader-${i}@example.com`,
        message: `note number ${i}`,
        ipHash,
      });
      expect(res).toEqual({ ok: true });
    }
    expect(await allMessages(t)).toHaveLength(8);

    // Ninth from the same IP: opaque ok, nothing written.
    const res = await t.mutation(api.messages.submitContact, {
      ...VALID_ARGS,
      email: "reader-9@example.com",
      message: "note number 9",
      ipHash,
    });
    expect(res).toEqual({ ok: true });
    expect(await allMessages(t)).toHaveLength(8);

    // A different IP is unaffected.
    const other = await t.mutation(api.messages.submitContact, {
      ...VALID_ARGS,
      email: "reader-10@example.com",
      message: "note number 10",
      ipHash: "b".repeat(64),
    });
    expect(other).toEqual({ ok: true });
    expect(await allMessages(t)).toHaveLength(9);
  });
});
