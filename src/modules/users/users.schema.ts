import { z as zod } from "zod";

export const usersSchema = zod.object({
    search: zod.string().trim().optional(),
    cursor: zod.coerce.number().int().positive().optional(),
    limit: zod.coerce.number().int().positive().default(10),
});

export type UsersParams = zod.infer<typeof usersSchema>;