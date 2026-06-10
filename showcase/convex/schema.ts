import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  subscribers: defineTable({
    email: v.string(),
    createdAt: v.number(),
    source: v.string(),
  }).index("by_email", ["email"]),
  messages: defineTable({
    email: v.string(),
    message: v.string(),
    name: v.optional(v.string()),
    source: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
