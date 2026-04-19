import prisma from "../../lib/prisma";
import { MessageList, MessageStatus } from "./message.types";

export const fetchMessages = async (conversationId: number, loggedInUserId: number): Promise<MessageList> => {
    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            content: true,
            conversationId: true,
            senderId: true,
            createdAt: true,
            updatedAt: true,
            messageStatuses: {
                where: { recipientId: loggedInUserId },
                select: {
                    statusType: true,
                    recipientId: true,
                },
                take: 1,
            }
        }
    })

    const messageList = messages.map(({ messageStatuses, ...message }) => ({
        ...message,
        recipientId: messageStatuses[0]?.recipientId ?? loggedInUserId,
        status: (messageStatuses[0]?.statusType) as MessageStatus
    }))

    return { messages: messageList };
}