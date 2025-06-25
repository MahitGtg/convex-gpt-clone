import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        tokenIdentifier: v.string(),
        }).index("by_token", ["tokenIdentifier"]),
    messages: defineTable({
        content: v.string(),
        userId: v.optional(v.id("users")),
        role: v.union(v.literal("user"), v.literal("assistant")),
        timestamp: v.number(),
        chatId: v.id("chats"),
        }).index("by_chat", ["chatId"]),
    chats: defineTable({
        name: v.string(),
        userId: v.optional(v.id("users")),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),
});