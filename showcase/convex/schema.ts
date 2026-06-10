import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  subscribers: defineTable({
    email: v.string(),
    createdAt: v.number(),
    source: v.string(),
    // Double opt-in state. `undefined` means a legacy row from before the
    // pending flow existed — treated as confirmed (backfill patches these).
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"))),
    // Set by a Node action after insert (mutations can't generate tokens).
    confirmToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["confirmToken"])
    .index("by_status", ["status"]),
  messages: defineTable({
    email: v.string(),
    message: v.string(),
    name: v.optional(v.string()),
    source: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
