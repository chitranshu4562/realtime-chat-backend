import { Server } from "socket.io";
import prisma from "../../lib/prisma";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
import { MESSAGE_EVENTS } from "../modules/message/message.events";
import { MESSAGE_STATUS, MessageStatusType } from "../modules/message/message.types";
import { getSocketId } from "../helpers/presence.helper";

function computeAggregateStatus(statuses: { statusType: string }[]): MessageStatusType {
    if (statuses.some((s) => s.statusType === MESSAGE_STATUS.PENDING)) return MESSAGE_STATUS.PENDING;
    if (statuses.some((s) => s.statusType === MESSAGE_STATUS.DELIVERED)) return MESSAGE_STATUS.DELIVERED;
    return MESSAGE_STATUS.READ;
}

export async function markConversationMessagesRead(
    socket: AuthenticatedSocket,
    io: Server,
    conversationId: number
): Promise<void> {
    // fetch PENDING messages for this user in this conversation (need content to deliver)
    const pendingStatuses = await prisma.messageStatus.findMany({
        where: {
            recipientId: socket.userId,
            statusType: MESSAGE_STATUS.PENDING,
            message: { conversationId },
        },
        include: {
            message: {
                include: {
                    sender: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { message: { createdAt: "asc" } },
    });

    // fetch DELIVERED messages for this user in this conversation (content already received)
    const deliveredStatuses = await prisma.messageStatus.findMany({
        where: {
            recipientId: socket.userId,
            statusType: MESSAGE_STATUS.DELIVERED,
            message: { conversationId },
        },
        select: { id: true, messageId: true, message: { select: { senderId: true, conversationId: true } } },
    });

    const pendingIds = pendingStatuses.map((s) => s.id);
    const deliveredIds = deliveredStatuses.map((s) => s.id);
    const allIds = [...pendingIds, ...deliveredIds];

    if (allIds.length === 0) return;

    // mark this recipient's statuses as READ in one query
    await prisma.messageStatus.updateMany({
        where: { id: { in: allIds } },
        data: { statusType: MESSAGE_STATUS.READ },
    });

    // deliver content of PENDING messages to the user
    if (pendingStatuses.length > 0) {
        socket.emit(MESSAGE_EVENTS.PENDING, pendingStatuses);
    }

    // build unique message → sender map
    const messageMap = new Map<number, { senderId: number; conversationId: number }>();
    for (const s of pendingStatuses) {
        messageMap.set(s.messageId, { senderId: s.message.senderId, conversationId: s.message.conversationId });
    }
    for (const s of deliveredStatuses) {
        messageMap.set(s.messageId, { senderId: s.message.senderId, conversationId: s.message.conversationId });
    }

    // for each affected message, compute the TRUE aggregate across ALL recipients
    // and notify the sender only if their socket is online
    for (const [messageId, { senderId, conversationId: convId }] of messageMap) {
        const senderSocketId = getSocketId(senderId);
        if (!senderSocketId) continue;

        const allRecipientStatuses = await prisma.messageStatus.findMany({
            where: { messageId },
            select: { statusType: true },
        });

        const aggregate = computeAggregateStatus(allRecipientStatuses);

        io.to(senderSocketId).emit(MESSAGE_EVENTS.STATUS_UPDATE, {
            messageId,
            conversationId: convId,
            status: aggregate,
        });
    }
}
