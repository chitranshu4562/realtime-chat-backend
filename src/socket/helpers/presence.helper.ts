const onlineUsers = new Map<number, string>();
// userId -> socketId

export function setOnline(userId: number, socketId: string): void {
    onlineUsers.set(userId, socketId);
}

export function setOffline(userId: number): void {
    onlineUsers.delete(userId);
}

export function isOnline(userId: number): boolean {
    return onlineUsers.has(userId);
}

export function getSocketId(userId: number): string | undefined {
    return onlineUsers.get(userId);
}