import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "./socket.types";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt";
import prisma from "../config/prisma";

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export async function socketAuthMiddleware(socket: AppSocket, next: (err?: Error) => void) {
    try {
        const token = socket.handshake.headers?.token as string | undefined;
        if (!token) return next(new Error("Token is missing"));

        const payload: AccessTokenPayload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true }
        })

        if (!user) return next(new Error("User not found"));

        socket.data.userId = user.id;
        socket.data.name = user.name || 'Your default name';

        next();
    } catch {
        next(new Error('Invalid Token'));
    }
}