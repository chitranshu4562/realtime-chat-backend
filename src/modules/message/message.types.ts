export type MessageStatus = "PENDING" | "READ";

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