import { Server } from "socket.io";
import { AuthenticatedSocket } from "../../middlewares/auth.middleware";
import { AcknowledgementCallback, socketErrorResponse, socketOkResponse } from "../../helpers/response.helper";
import { logger } from "../../../helpers/logger";
import { getConversationRoom, hasJoinedRoom } from "../../helpers/room.helper";
import { getErrorMessage } from "../../helpers/util.helper";
import { isConversationMember } from "../../../services/conversation.service";
import prisma from "../../../lib/prisma";
import { MESSAGE_EVENTS } from "./message.events";
import { SendMessagePayload, sendMessageSchema } from "./message.schema";
import { withValidation } from "../../helpers/validate.helper";
import { isOnline } from "../../helpers/presence.helper";
import { MESSAGE_STATUS } from "./message.types";

export function registerMessageHandlers(
    io: Server,
    socket: AuthenticatedSocket,
): void {

    // send message handler
    async function sendMessageHandler({ conversationId, content }: SendMessagePayload, callback: AcknowledgementCallback) {
        try {
            const roomName = getConversationRoom(conversationId);
            // first check that socket (user) has joined conversation room or not
            if (!hasJoinedRoom(socket, roomName)) {
                throw new Error('You have not joined conversation');
            }

            const isMember = await isConversationMember(conversationId, socket.userId);
            if (!isMember) throw new Error('You are not member of this conversation');

            // fetch all recipients for this conversation excluding sender
            const recipientIds = await prisma.conversationMember.findMany({
                where: {
                    conversationId: conversationId,
                    userId: { not: socket.userId }
                },
                select: {
                    userId: true
                }
            });


            const onlineRecipientIds = new Set(recipientIds.map(({ userId }) => userId).filter((userId) => isOnline(userId)));

            // create message and message statuses entry for all recipients
            const message = await prisma.message.create({
                data: {
                    content: content,
                    conversationId: conversationId,
                    senderId: socket.userId,
                    messageStatuses: {
                        createMany: {
                            data: recipientIds.map(({ userId }) => ({
                                recipientId: userId,
                                statusType: onlineRecipientIds.has(userId) ? MESSAGE_STATUS.READ : MESSAGE_STATUS.PENDING
                            }))
                        }
                    }
                },
                include: {
                    sender: {
                        select: { id: true, name: true }
                    },
                    messageStatuses: {
                        select: { recipientId: true, statusType: true }
                    }
                }
            })

            // broadcast this message to room (online sockets(users) who has joined this room) (this includes all users(sockets) except sender in this room)
            socket.to(roomName).emit(MESSAGE_EVENTS.NEW, socketOkResponse('New message sent', message));

            logger.info(`Message: '${message.content}', message id: ${message.id} sent to conversation: ${conversationId}`)
            callback(socketOkResponse('New message sent', message))

        } catch (err: unknown) {
            logger.error(`userId: ${socket.userId}, username: ${socket.username} failed to leave conversation room: ${getConversationRoom(conversationId)}`)
            callback(socketErrorResponse(getErrorMessage(err, 'Failed to received content')))
        }
    }

    // listen send message event
    socket.on(MESSAGE_EVENTS.SEND, withValidation(socket, sendMessageSchema, sendMessageHandler));
}