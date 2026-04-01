import { Socket } from "socket.io";
import { AccessTokenPayload, verifyAccessToken } from "../../utils/jwt";
import prisma from "../../lib/prisma";

export interface AuthenticatedSocket extends Socket {
    userId: number;
    username: string | null;
}

export async function authMiddleware(
    socket: Socket,
    next: (err?: Error) => void
): Promise<void> {
    try {
        const authToken = extractAuthToken(socket);

        const authTokenPayload: AccessTokenPayload = verifyAccessToken(authToken);

        const user = await prisma.user.findUnique({
            where: { id: authTokenPayload.userId },
            select: {
                id: true,
                name: true
            }
        })

        if (!user) throw new Error('Unauthorised');

        const authenticatedSocket = socket as AuthenticatedSocket;
        authenticatedSocket.userId = user.id;
        authenticatedSocket.username = user.name;

        next();

    } catch (err: unknown) {
        next(new Error(err instanceof Error ? err.message : 'Unauthorized'))
    }
}

function extractAuthToken(socket: Socket): string {
    console.log('handshake', socket.handshake)
    const authToken = socket.handshake.headers?.token;
    if (!authToken) throw new Error('Token is missing')

    return authToken as string;
}