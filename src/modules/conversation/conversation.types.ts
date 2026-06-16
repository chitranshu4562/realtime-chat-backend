import { CurrentUser } from "../types";
import { CreateConversationInput, GetConversationsParams } from "./conversation.schema";

export const ConversationType = {
    DIRECT: 'DIRECT',
    GROUP: 'GROUP'
} as const;

export const MemberType = {
    MEMBER: 'MEMBER',
    ADMIN: 'ADMIN'
} as const;

export interface CreateConversationInputData extends CreateConversationInput, CurrentUser { };

export interface CreateConversationResponse {
    conversationId: number;
}

export interface ConversationListParams extends GetConversationsParams, CurrentUser { };

interface ConversationMember {
    id: number;
    name: string | null;
}

interface Conversation {
    id: number;
    type: typeof ConversationType[keyof typeof ConversationType];
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    members: ConversationMember[];
}

// API response wrapper
export interface ConversationListResponse {
    conversations: Conversation[];
}