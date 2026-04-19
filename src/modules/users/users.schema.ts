import { z as zod } from "zod";
import { emptyToUndefined } from "../../utils/util";

export const usersSchema = zod.object({
    search: zod.string().trim().optional(),
    cursor: zod.preprocess(emptyToUndefined, zod.coerce.number().int().positive().optional()),
    limit: zod.preprocess(emptyToUndefined, zod.coerce.number().int().positive().default(10)),
});

export type UsersParams = zod.infer<typeof usersSchema>;