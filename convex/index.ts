import { internal } from "./_generated/api";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
    args: {
        tokenIdentifier: v.string(), 
        name: v.string(),
    },  
    returns: v.id("users"),
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier)).unique();
        if (!user) {
            const newId = await ctx.db.insert("users", {
                name: args.name,
                tokenIdentifier: args.tokenIdentifier,
            });
            return newId as Id<"users">;
        }
        return user?._id as Id<"users">;
    },
});

export const listChats = query({
    args: {
        userId: v.id("users"),
    },
    returns: v.array(v.object({
        _id: v.id("chats"),
        name: v.string(),
        userId: v.optional(v.id("users")),
        createdAt: v.number(),
        updatedAt: v.number(),
        _creationTime: v.number(),
    })),
    handler: async (ctx, args) => {
        const chats = await ctx.db
        .query("chats")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

        return chats;
    },
});


export const deleteChat = mutation({
    args: {
        chatId: v.id("chats"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.delete(args.chatId);
        return null;
    },
});

export const createChat = mutation({
    args: {
        userId: v.id("users"),
    },
    returns: v.id("chats"),
    handler: async (ctx, args) => {
        const chatId = await ctx.db.insert("chats", {
            name: "New Chat" + Date.now(),
            userId: args.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        return chatId as Id<"chats">;
    },
});

export const updateChat = mutation({
    args: {
        chatId: v.id("chats"),
        name: v.string(),
        userId: v.id("users"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.chatId, {
            name: args.name,
            userId: args.userId,
            updatedAt: Date.now(),
        });
        return null;
    },
});

export const sendMessage = mutation({
    args: {
        chatId: v.id("chats"),
        userId: v.optional(v.id("users")),
        content: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            content: args.content,
            userId: args.userId ?? undefined,
            role: "user",
            timestamp: Date.now(),
            chatId: args.chatId,
        });
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .order("desc")
            .take(20);

        await ctx.scheduler.runAfter(0, internal.openai.chat, {
            messages,
            messageId: messageId as Id<"messages">,
        });

            return null;
        },
        });

export const addAssistantMessage = internalMutation({
    args: {
        messageId: v.id("messages"),
        content: v.string(),
        chatId: v.id("chats"),
    },
    returns: v.null(),
        handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            content: args.content,
            role: "assistant",
            timestamp: Date.now(),
            chatId: args.chatId,
        });
        return null;
    },
});

export const listMessages = query({
    args: { chatId: v.id("chats") },
    returns: v.array(v.object({
        _id: v.id("messages"),
        content: v.string(),
        userId: v.optional(v.id("users")),
        role: v.union(v.literal("user"), v.literal("assistant")),
        timestamp: v.number(),
        chatId: v.id("chats"),
        _creationTime: v.number(),
    })),
    handler: async (ctx, args) => {
      return await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
        .order("asc")
        .collect();
    },
  });