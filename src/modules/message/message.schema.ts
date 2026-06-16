import zod from "zod";

export const getMessagesSchema = zod.object({
    conversationId: zod
        .union([zod.string(), zod.number()], {
            error: 'Conversation Id is required'
        })
        .pipe(zod.coerce.number())
})

export const getMessageDetailsSchema = zod.object({
    messageId: zod
        .union([zod.string(), zod.number()], {
            error: 'Message Id is required'
        })
        .pipe(zod.coerce.number())
})