import prisma from "../../lib/prisma";
import { GetUsersParams, GetUsersResult } from "./users.types";

export const getUsers = async ({ loggedInUserId, search, cursor, limit }: GetUsersParams): Promise<GetUsersResult> => {
    const take = limit + 1;

    const whereQuery = {
        id: {
            not: loggedInUserId
        },
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ]
        })
    };

    const users = await prisma.user.findMany({
        where: whereQuery,
        take: take,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1
        }),
        orderBy: { id: 'asc' },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            createdAt: true
        }
    });

    const hasMore = users.length > limit;
    if (hasMore) {
        users.pop();
    }

    const nextCursor = hasMore ? users[users.length - 1].id : null;
    return { users, nextCursor, hasMore };
}