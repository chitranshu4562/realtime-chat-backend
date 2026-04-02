import { AuthenticatedSocket } from "../../middlewares/auth.middleware";
import { AcknowledgementCallback, socketErrorResponse, socketOkResponse } from "../../helpers/response.helper";
import { logger } from "../../../helpers/logger";
import { conversationRoom } from "../../helpers/room.helper";
import { getErrorMessage } from "../../helpers/util.helper";
import { isConversationMember } from "../../../services/conversation.service";
import { CONVERSATION_EVENTS } from "./conversation.events";
import { JoinConversationPayload, joinConversationSchema, LeaveConversationPayload, leaveConversationSchema } from "./conversation.schema";
import { withValidation } from "../../helpers/validate.helper";

export function registerConversationHandlers(socket: AuthenticatedSocket): void {

    // join conversation handler
    async function joinConversationHandler({ conversationId }: JoinConversationPayload, callback: AcknowledgementCallback) {
        try {
            const isMember = await isConversationMember(conversationId, socket.userId);
            if (!isMember) throw new Error('You are not allowed to join this conversation, please create conversation first');

            // now join conversation room
            await socket.join(conversationRoom(conversationId))

            logger.info(`userId: ${socket.userId}, username: ${socket.username} joined conversation room: ${conversationRoom(conversationId)}`)
            callback(socketOkResponse('You have joined conversation'))
        } catch (err: unknown) {
            logger.error(`userId: ${socket.userId}, username: ${socket.username} failed to join conversation room: ${conversationRoom(conversationId)}`)
            callback(socketErrorResponse(getErrorMessage(err, 'Failed to join conversation')));
        }
    }

    // leave conversation handler

    async function leaveConversationHandler({ conversationId }: LeaveConversationPayload, callback: AcknowledgementCallback) {
        try {
            await socket.leave(conversationRoom(conversationId));
            logger.info(`userId: ${socket.userId}, username: ${socket.username} left conversation room: ${conversationRoom(conversationId)}`)
            callback(socketOkResponse('You have left conversation'))
        } catch (err: unknown) {
            logger.error(`userId: ${socket.userId}, username: ${socket.username} failed to leave conversation room: ${conversationRoom(conversationId)}`)
            callback(socketErrorResponse(getErrorMessage(err, 'Failed to leave conversation')));
        }
    }

    // listen join conversation event
    socket.on(CONVERSATION_EVENTS.JOIN, withValidation(socket, joinConversationSchema, joinConversationHandler));

    // listed leave conversation event
    socket.on(CONVERSATION_EVENTS.LEAVE, withValidation(socket, leaveConversationSchema, leaveConversationHandler));
}