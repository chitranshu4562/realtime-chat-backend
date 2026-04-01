import { Server } from "socket.io";
import { AuthenticatedSocket } from "../../middlewares/auth.middleware";
import { AcknowledgementCallback, socketErrorResponse, socketOkResponse } from "../../helpers/response.helper";
import { logger } from "../../../helpers/logger";
import { conversationRoom } from "../../helpers/room.helper";
import { getErrorMessage } from "../../helpers/util.helper";
import { isConversationMember } from "../../../services/conversation.service";
import prisma from "../../../lib/prisma";
import { MESSAGE_EVENTS } from "./message.events";
import { SendMessagePayload } from "./message.schema";

export function registerMessageHandlers(
    io: Server,
    socket: AuthenticatedSocket,
): void {

    // send message handler
    async function sendMessageHandler({ conversationId, content }: SendMessagePayload, callback: AcknowledgementCallback) {
        try {
            if (!content || content.trim().length === 0) throw new Error('Content is required');

            const isMember = await isConversationMember(conversationId, socket.userId);
            if (!isMember) throw new Error('You are not member of this conversation');

            // store message in database
            const message = await prisma.message.create({
                data: {
                    content: content.trim(),
                    conversationId: conversationId,
                    senderId: socket.userId,
                },
                include: {
                    sender: {
                        select: { id: true, name: true }
                    }
                }
            });

            // broadcast this message to room (this includes all sockets in this room)
            io.to(conversationRoom(conversationId)).emit(MESSAGE_EVENTS.NEW, socketOkResponse('New message sent', message));

            logger.info(`Message: '${message.content}', message id: ${message.id} sent to conversation: ${conversationId}`)
            callback(socketOkResponse('New message sent', message))

        } catch (err: unknown) {
            logger.error(`userId: ${socket.userId}, username: ${socket.username} failed to leave conversation room: ${conversationRoom(conversationId)}`)
            callback(socketErrorResponse(getErrorMessage(err, 'Failed to received content')))
        }
    }

    // listen send message event
    socket.on(MESSAGE_EVENTS.SEND, sendMessageHandler);
}