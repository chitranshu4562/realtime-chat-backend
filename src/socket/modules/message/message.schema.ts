import { z as zod } from "zod";

export const sendMessageSchema = zod.object({
    conversationId: zod
        .string({ error: 'Conversation id is required' })
        .or(zod.number({ error: "Conversation id is required" })).pipe(zod.coerce.number()),
    content: zod
        .string({ error: 'Content is required' })
        .min(1, { error: 'Content should have some text' })
})

export type SendMessagePayload = zod.infer<typeof sendMessageSchema>;