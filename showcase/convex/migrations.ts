import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * One-shot backfill for the double opt-in rollout: legacy subscriber rows
 * (created before `status` existed) are confirmed by definition, so patch
 * `undefined` -> "confirmed". Paginates in batches of 100 and reschedules
 * itself until done. Safe to re-run; rows with a status are left untouched.
 *
 * Run with: npx convex run migrations:backfillSubscriberStatus
 */
export const backfillSubscriberStatus = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("subscribers")
      .paginate({ numItems: 100, cursor: cursor ?? null });

    for (const doc of page.page) {
      if (doc.status === undefined) {
        await ctx.db.patch(doc._id, { status: "confirmed" });
      }
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrations.backfillSubscriberStatus, {
        cursor: page.continueCursor,
      });
    }
  },
});
