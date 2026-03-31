import { z as zod } from "zod";
import { ConversationType } from "./conversation.types";

export const createConversationSchema = zod.object({
    type: zod.enum(Object.values(ConversationType)).default(ConversationType.DIRECT),
    memberIds: zod.array(zod.number().int().positive(), { error: 'Member ids are required' }).nonempty({
        message: "memberIds must have at least one member."
    })
}).superRefine((data, ctx) => {
    if (data.type === ConversationType.DIRECT && data.memberIds.length !== 1) {
        ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: "You can have chat with one member in one-to-one chat",
            path: ["memberIds"]
        })
    }
})

export type CreateConversationInput = zod.infer<typeof createConversationSchema>;