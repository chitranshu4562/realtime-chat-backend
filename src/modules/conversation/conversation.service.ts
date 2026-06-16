import prisma from "../../lib/prisma";
import { BadRequestError } from "../../errors/AppError";
import { ConversationListParams, ConversationListResponse, CreateConversationInputData, CreateConversationResponse } from "./conversation.types";
import { ConversationType, MemberType } from "./conversation.types";
import { ConversationType as PrismaConversationType } from "../../generated/prisma/enums";

export const createConversation = async (data: CreateConversationInputData): Promise<CreateConversationResponse> => {
    const allMemberIds = [...new Set([data.loggedInUserId, ...data.memberIds])];
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

    // prevent duplicate conversation creation for DIRECT chats
    if (data.type === ConversationType.DIRECT) {
        const result = await prisma.conversationMember.groupBy({
            by: ['conversationId'],
            where: {
                userId: { in: allMemberIds },
                conversation: { type: data.type as PrismaConversationType }
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
            createdById: data.loggedInUserId,
            type: data.type as PrismaConversationType,
            name: data.type === ConversationType.GROUP ? (data.name ?? null) : null,
            conversationMembers: {
                create: allMemberIds.map((userId) => ({
                    userId,
                    role: userId === data.loggedInUserId ? MemberType.ADMIN : MemberType.MEMBER
                }))
            }
        },
        include: {
            conversationMembers: {
                select: { userId: true, role: true }
            }
        }
    })

    return { conversationId: conversation.id };
}

export const fetchConversations = async ({ loggedInUserId }: ConversationListParams): Promise<ConversationListResponse> => {
    const conversations = await prisma.conversation.findMany({
        where: {
            conversationMembers: {
                some: { userId: loggedInUserId }
            }
        },
        select: {
            id: true,
            type: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            conversationMembers: {
                select: {
                    role: true,
                    user: {
                        select: { id: true, name: true }
                    }
                },
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const formattedResponse = conversations.map(({ conversationMembers, ...conversation }) => ({
        ...conversation,
        members: conversationMembers.map(({ user, role }) => ({
            ...user,
            isAdmin: role === MemberType.ADMIN
        }))
    }));

    return { conversations: formattedResponse };
}
