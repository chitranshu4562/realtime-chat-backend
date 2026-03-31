// ── what client sends to server ───────────────────────────────

export interface SendMessagePayload {
    conversationId: number;
    content: string;
}

export interface JoinConversationPayload {
    conversationId: number;
}

// ── what server sends to client ───────────────────────────────

export interface NewMessagePayload {
    id: number;
    conversationId: number;
    content: string;
    senderId: number;
    senderName: string;
    createdAt: string;
}

// ── the two event maps ─────────────────────────────────────────

export interface ClientToServerEvents {
    'conversation:join': (
        payload: JoinConversationPayload,
        callback: (res: SocketReponse) => void
    ) => void;
    'conversation:leave': (
        payload: JoinConversationPayload,
        callback: (res: SocketReponse) => void
    ) => void;
    'message:send': (
        payload: SendMessagePayload,
        callback: (res: SocketReponse) => void
    ) => void;
}

export interface ServerToClientEvents {
    'message:new': (payload: NewMessagePayload) => void;
}

export interface SocketData {
    userId: number;
    name: string;
}

// ── the two event maps ─────────────────────────────────────────

export interface SocketReponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}