import { z as zod } from "zod";
import { ConversationType } from "./conversation.types";

export const createConversationSchema = zod.object({
    type: zod.enum(Object.values(ConversationType) as [string, ...string[]]).default(ConversationType.DIRECT),
    name: zod.string().trim().min(1, 'Group name cannot be empty').optional(),
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
    if (data.type === ConversationType.GROUP && !data.name) {
        ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: "Group name is required",
            path: ["name"]
        })
    }
    if (data.type === ConversationType.GROUP && data.memberIds.length < 2) {
        ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: "A group must have at least 2 other members",
            path: ["memberIds"]
        })
    }
})

export const getConversationsSchema = zod.object({
    search: zod.string().trim().optional(),
})

export type CreateConversationInput = zod.infer<typeof createConversationSchema>;
export type GetConversationsParams = zod.infer<typeof getConversationsSchema>;
