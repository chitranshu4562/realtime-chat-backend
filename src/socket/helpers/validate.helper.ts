import { z as zod, ZodType } from "zod";
import { AcknowledgementCallback, socketErrorResponse } from "./response.helper";
import { Socket } from "socket.io";
import { SOCKET_EVENTS } from "../events";

type validateHandler<T> = (payload: T, callback: AcknowledgementCallback) => void;

export function withValidation<Schema extends ZodType>(
    socket: Socket,
    schema: Schema,
    handler: validateHandler<zod.infer<Schema>>,
): (payload: unknown, callback: AcknowledgementCallback) => void {
    return (payload, callback) => {
        if (typeof callback !== 'function') {
            socket.emit(SOCKET_EVENTS.SYSTEM.ERROR, socketErrorResponse('Acknowledgement callback is required'));
            return;
        }
        const result = schema.safeParse(payload);

        if (!result.success) {
            const message = result.error.issues[0]?.message ?? 'Validation failed';
            console.log('validation issues', result.error.issues)
            return callback(socketErrorResponse(message));
        }

        handler(result.data, callback);
    }
}
