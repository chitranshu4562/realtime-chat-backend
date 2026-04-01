import prisma from "../../configs/prisma";
import { BadRequestError } from "../../errors/AppError";
import { CreateConversationInput } from "./conversation.schema";
import { ConversationType, MemberType } from "./conversation.types";

export const createConversation = async (creatorId: number, data: CreateConversationInput) => {
    const allMemberIds = [...new Set([creatorId, ...data.memberIds])];
    if (allMemberIds.length < 2) throw new BadRequestError('You are not allowed to send message to yourself.')

    const users = await prisma.user.findMany({
        where: { id: { in: allMemberIds } },
        select: { id: true }
    })

    if (allMemberIds.length !== users.length) {
        const foundIds = users.map(u => u.id);
        const missingIds = allMemberIds.filter(id => !foundIds.includes(id));
        throw new BadRequestError(`User not found having these ids: ${missingIds.join(', ')}`)
    }

    // prevent duplicate conversation creation
    if (data.type === ConversationType.DIRECT) {
        const result = await prisma.conversationMember.groupBy({
            by: ['conversationId'],
            where: {
                userId: { in: allMemberIds },
                conversation: { type: data.type }
            },
            _count: { userId: true },
            having: {
                userId: {
                    _count: { equals: 2 }
                }
            }
        })

        if (result.length > 0) return { conversationId: result[0].conversationId };
    }

    const conversation = await prisma.conversation.create({
        data: {
            createdById: creatorId,
            type: data.type,
            conversationMembers: {
                create: allMemberIds.map((userId) => ({
                    userId,
                    role: userId === creatorId ? MemberType.ADMIN : MemberType.MEMBER
                }))
            }
        },
        include: {
            conversationMembers: {
                select: {
                    userId: true, role: true
                }
            }
        }
    })

    return { conversationId: conversation.id };
}