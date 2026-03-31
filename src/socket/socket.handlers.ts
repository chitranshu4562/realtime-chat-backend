import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './socket.types';
import prisma from '../config/prisma';
import { logger } from '../shared/logger';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type IO = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export function registerHandlers(io: IO, socket: AppSocket) {
    const { userId, name } = socket.data;

    // ── Joining the personal room ────────────────────────
    socket.join(`user:${userId}`);
    logger.info(`[socket] ${name} connected - socket ${socket.id}`)

    // ── The conversation:join handler ────────────────────────
    socket.on('conversation:join', async ({ conversationId }, callback) => {
        try {
            const member = await prisma.conversationMember.findUnique({
                where: {
                    conversationId_userId: { conversationId, userId } // conversationId_userId, prisma generate via @@unique([conversationId, userId])
                }
            })

            if (!member) {
                throw new Error('You are not a member of this conversation.')
            }

            // join room to receive all
            // event emitted to conversation:${conversationId}
            socket.join(`conversation:${conversationId}`)
            logger.info(`[socket] ${name} joined conversation:${conversationId}`)
            callback({ success: true, message: 'Conversation started', data: { name, conversationId } })
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Something went wrong';
            logger.error(errMessage);
            callback({ success: false, message: errMessage })
        }
    })

    // ── The conversation:leave handler ────────────────────────
    socket.on('conversation:leave', async ({ conversationId }, callback) => {
        try {
            socket.leave(`conversation:${conversationId}`)
            logger.info(`[socket] ${name} joined conversation:${conversationId}`)
            callback({ success: true, message: 'Conversation ended', data: { name, conversationId } })
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Something went wrong';
            logger.error(errMessage);
            callback({ success: false, message: errMessage })
        }
    })

    // ── message:send ───────────────────────────────────────────
    socket.on('message:send', async ({ conversationId, content }, callback) => {
        try {
            if (!content || content.trim().length === 0) {
                throw new Error('Message can not be empty.');
            }

            const member = await prisma.conversationMember.findUnique({
                where: {
                    conversationId_userId: { conversationId, userId }
                }
            })

            if (!member) {
                throw new Error('You are not a member of this conversation.');
            }

            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: {
                        conversationId,
                        senderId: userId,
                        content: content.trim()
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                }),

                // for correct sorting conversation using updated_at
                prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
                })
            ])

            io.to(`conversation:${conversationId}`).emit('message:new', {
                id: message.id,
                conversationId: message.conversationId,
                content: message.content ?? '',
                senderId: message.senderId,
                senderName: message.sender.name ?? '',
                createdAt: message.createdAt.toISOString()
            })

            logger.info(`[socket] ${name} → conv:${conversationId}: "${content.trim()}"`)
            callback({ success: true, message: 'Message sent', data: { message } })
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Something went wrong';
            logger.error(errMessage);
            callback({ success: false, message: errMessage })
        }
    })

    // ── disconnect socket ───────────────────────────────────────────
    socket.on('disconnect', (reason) => {
        logger.info(`[socket] ${name} disconnected — reason: ${reason}`)
    })
}