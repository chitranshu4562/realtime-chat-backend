import prisma from "../../lib/prisma";
import { MessageDetails, MessageList, MessageStatus } from "./message.types";
import { NotFoundError, UnauthorizedError } from "../../errors/AppError";

function aggregateStatus(statuses: Array<{ statusType: string }>): MessageStatus {
    if (statuses.some((s) => s.statusType === "PENDING")) return "PENDING";
    if (statuses.some((s) => s.statusType === "DELIVERED")) return "DELIVERED";
    return "READ";
}

export const fetchMessages = async (conversationId: number, loggedInUserId: number): Promise<MessageList> => {
    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            content: true,
            conversationId: true,
            senderId: true,
            createdAt: true,
            updatedAt: true,
            messageStatuses: {
                select: { statusType: true, recipientId: true },
            },
        },
    });

    const messageList = messages.map(({ messageStatuses, ...message }) => {
        const isSentByMe = message.senderId === loggedInUserId;

        let status: MessageStatus;
        let recipientId: number;

        if (isSentByMe) {
            status = messageStatuses.length > 0 ? aggregateStatus(messageStatuses) : "READ";
            recipientId = messageStatuses.find((s) => s.recipientId !== loggedInUserId)?.recipientId ?? loggedInUserId;
        } else {
            const myStatus = messageStatuses.find((s) => s.recipientId === loggedInUserId);
            status = (myStatus?.statusType ?? "READ") as MessageStatus;
            recipientId = loggedInUserId;
        }

        return { ...message, recipientId, status };
    });

    return { messages: messageList };
};

export const fetchMessageDetails = async (messageId: number, loggedInUserId: number): Promise<MessageDetails> => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: {
            id: true,
            content: true,
            createdAt: true,
            sender: { select: { id: true, name: true } },
            conversation: {
                select: {
                    conversationMembers: {
                        where: { userId: loggedInUserId },
                        select: { userId: true },
                    },
                },
            },
            messageStatuses: {
                select: {
                    recipientId: true,
                    statusType: true,
                    updatedAt: true,
                    recipient: { select: { name: true } },
                },
                orderBy: { updatedAt: 'asc' },
            },
        },
    });

    if (!message) throw new NotFoundError('Message not found');
    if (message.conversation.conversationMembers.length === 0) {
        throw new UnauthorizedError('You are not a member of this conversation');
    }

    return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
        statuses: message.messageStatuses.map((s) => ({
            recipientId: s.recipientId,
            recipientName: s.recipient.name,
            statusType: s.statusType as MessageStatus,
            updatedAt: s.updatedAt,
        })),
    };
};
