import { z as zod } from 'zod';

export const joinConversationSchema = zod.object({
    conversationId: zod
        .string({ error: 'Conversation id is required' })
        .or(zod.number({ error: "Conversation id is required" })).pipe(zod.coerce.number()),
});


export const leaveConversationSchema = zod.object({
    conversationId: zod
        .string({ error: 'Conversation id is required' })
        .or(zod.number({ error: "Conversation id is required" })).pipe(zod.coerce.number()),
});

export type JoinConversationPayload = zod.infer<typeof joinConversationSchema>;
export type LeaveConversationPayload = zod.infer<typeof leaveConversationSchema>;
