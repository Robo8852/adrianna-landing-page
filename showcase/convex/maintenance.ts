import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Pendings whose confirmation email never got a token (e.g. the send action
 * failed permanently) have no tokenExpiry to expire — purge them once they
 * are clearly abandoned.
 */
const TOKENLESS_MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000; // 8 days

const BATCH_SIZE = 100;

/**
 * Deletes pending subscribers that will never confirm:
 *  - token issued but expired (tokenExpiry < now), or
 *  - no token ever issued and the row is older than 8 days.
 *
 * Works in batches of 100 and reschedules itself when a full batch was
 * deleted, so a large backlog drains without blowing mutation limits.
 * Registered as a daily cron in crons.ts.
 */
export const purgeExpiredPending = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const tokenlessCutoff = now - TOKENLESS_MAX_AGE_MS;

    // NOTE: in Convex ordering, undefined sorts below every number, so a
    // bare lt(tokenExpiry, now) would also match tokenless rows — each
    // branch must pin down whether the token fields exist.
    const expired = await ctx.db
      .query("subscribers")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) =>
        q.or(
          q.and(
            q.neq(q.field("tokenExpiry"), undefined),
            q.lt(q.field("tokenExpiry"), now),
          ),
          q.and(
            q.eq(q.field("confirmToken"), undefined),
            q.lt(q.field("createdAt"), tokenlessCutoff),
          ),
        ),
      )
      .take(BATCH_SIZE);

    for (const doc of expired) {
      await ctx.db.delete(doc._id);
    }

    // A full batch means there may be more — keep going in a fresh mutation.
    if (expired.length === BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.maintenance.purgeExpiredPending, {});
    }
  },
});
