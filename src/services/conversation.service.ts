import prisma from "../lib/prisma";

export async function isConversationMember(
    conversationId: number,
    userId: number
): Promise<boolean> {
    const member = await prisma.conversationMember.findUnique({
        where: {
            conversationId_userId: { conversationId, userId }
        },
        select: {
            id: true
        }
    })

    return !!member;
} 