import { z as zod, ZodType } from "zod";
import { AcknowledgementCallback, socketErrorResponse } from "./response.helper";

type validateHandler<T> = (payload: T, callback: AcknowledgementCallback) => void;

export function withValidation<Schema extends ZodType>(
    schema: Schema,
    handler: validateHandler<zod.infer<Schema>>,
): (payload: unknown, callback: AcknowledgementCallback) => void {
    return (payload, callback) => {
        const result = schema.safeParse(payload);

        if (!result.success) {
            const message = result.error.issues[0]?.message ?? 'Validation failed';
            return callback(socketErrorResponse(message));
        }

        handler(result.data, callback);
    }
}
