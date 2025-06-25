import { OpenAI } from "openai";
import { internalAction } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type ChatParams = {
  messages: Doc<"messages">[];
  messageId: Id<"messages">;
};
export const chat = internalAction({
  handler: async (ctx, { messages, messageId }: ChatParams) => {
    //...Create and handle a stream request
    // inside the chat function in convex/openai.ts
    const apiKey = process.env.OPENAI_API_KEY_3!;
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", 
    stream: true,
    messages: [
        {
        role: "system",
        content: "You are a terse bot in a group chat responding to q's.",
        },
        ...messages.map(({ content, role }) => ({
        role:
            role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: content,
        })),
    ],
    });
    let body = "";
    for await (const part of stream) {
    if (part.choices[0].delta?.content) {
        body += part.choices[0].delta.content;
        }
    }
    await ctx.runMutation(internal.index.addAssistantMessage, {
        messageId,
        content: body,
        chatId: messages[0].chatId,
        });
    },
});
