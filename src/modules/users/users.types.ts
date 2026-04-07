import { Prisma } from "../../generated/prisma/client";
import { CurrentUser } from "../types";
import { UsersParams } from "./users.schema";

export interface GetUsersParams extends UsersParams, CurrentUser { };

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