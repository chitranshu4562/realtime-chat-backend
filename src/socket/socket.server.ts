import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "./socket.types";
import { env } from "../config/env";
import { socketAuthMiddleware } from "./socket.middleware";
import { registerHandlers } from "./socket.handlers";
import { logger } from "../shared/logger";


export function createSocketServer(httpServer: HttpServer) {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            credentials: true
        },

        // pingInterval: how often Socket.IO checks if client is alive (ms)
        // pingTimeout:  how long to wait for pong before declaring disconnect
        // Together they detect dead connections (crashed tabs, lost network)
        pingInterval: 25000,
        pingTimeout: 20000,
    })

    // ── step 1: attach auth middleware ────────────────────────
    //
    // io.use() registers middleware that runs on EVERY new connection
    // BEFORE the 'connection' event fires.
    //
    // If middleware calls next(error) → socket is rejected
    // If middleware calls next()      → socket is accepted, proceeds to handlers

    io.use(socketAuthMiddleware);

    // ── step 2: register handlers per connection ─────────────
    //
    // io.on('connection') fires for every socket that passes middleware.
    // We call registerHandlers(io, socket) which sets up all the
    // event listeners for that one socket.

    io.on('connection', (socket) => {
        registerHandlers(io, socket)
    })

    logger.info('[Socket.IO] Server ready')
    return io
}