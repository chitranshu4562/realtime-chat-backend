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
    'conversation:join': (payload: JoinConversationPayload) => void;
    'conversation:leave': (payload: JoinConversationPayload) => void;
    'message:send': (payload: SendMessagePayload) => void;
}

export interface ServerToClientEvents {
    'message:new': (payload: NewMessagePayload) => void;
    'error': (payload: { message: string }) => void;
}

export interface SocketData {
    userId: number;
    name: string;
}