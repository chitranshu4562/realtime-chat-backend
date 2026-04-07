import { Prisma } from "../../generated/prisma/client";
import { CurrentUser } from "../types";

export interface GetUsersParams extends CurrentUser {
    search?: string;
    cursor?: number;
    limit?: number;
}

const userSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    createdAt: true,
} satisfies Prisma.UserSelect;

interface SelectedUser extends Prisma.UserGetPayload<{ select: typeof userSelect }> { };

export interface GetUsersResult {
    users: SelectedUser[];  // ✅ matches the actual select shape
    nextCursor: SelectedUser['id'] | null;
    hasMore: boolean;
}