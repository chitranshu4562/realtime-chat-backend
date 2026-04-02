import { AuthenticatedSocket } from "../middlewares/auth.middleware";

export const getConversationRoom = (conversationId: number): string => {
    return `conversation:${conversationId}`;
}

export const hasJoinedRoom = (socket: AuthenticatedSocket, roomName: string): boolean => {
    return socket.rooms.has(roomName);
}