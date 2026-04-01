import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { AuthenticatedSocket, authMiddleware } from "./middlewares/auth.middleware";
import { SOCKET_EVENTS } from "./events";
import { logger } from "../helpers/logger";
import { registerConversationHandlers } from "./modules/conversation/conversation.handler";
import { registerMessageHandlers } from "./modules/message/message.handler";

export function initSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            credentials: true
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 1 * 60 * 1000, // ms server wait for client to reconnect existing socket
            skipMiddlewares: false, // run all middleware after reconnection
        },

        pingTimeout: 20_000, // server will wait 20s for pong response from client
        pingInterval: 25_000, // server will fire ping for every 25s
    });

    // ── Global auth middleware (runs once per connection) ──────────────────

    io.use(authMiddleware);


    // ── Per-socket handler registration ───────────────────────────────────

    io.on(SOCKET_EVENTS.SYSTEM.CONNECT, (rawSocket: Socket) => {
        const socket = rawSocket as AuthenticatedSocket;

        logger.info(`socket connected: ${socket}`);

        registerConversationHandlers(socket);

        registerMessageHandlers(io, socket);

        socket.on(SOCKET_EVENTS.SYSTEM.DISCONNECT, (reason) => {
            logger.info(`socket disconnected: ${socket}\nwith reason: ${reason}`)
        })

        socket.on(SOCKET_EVENTS.SYSTEM.ERROR, (err) => {
            logger.error(`socket error: ${err}`)
        })

    });

    return io;
}