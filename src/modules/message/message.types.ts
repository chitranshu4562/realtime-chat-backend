export type MessageStatus = "PENDING" | "DELIVERED" | "READ";

export interface Message {
    id: number;
    content: string;
    conversationId: number;
    senderId: number;
    recipientId: number;
    status: MessageStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageList {
    messages: Message[];
}

export interface GetMessagesParams {
    conversationId: number;
}

export interface MessageRecipientStatus {
    recipientId: number;
    recipientName: string | null;
    statusType: MessageStatus;
    updatedAt: Date;
}

export interface MessageDetails {
    id: number;
    content: string;
    createdAt: Date;
    sender: { id: number; name: string | null };
    statuses: MessageRecipientStatus[];
}

export interface GetMessageDetailsParams {
    messageId: number;
}