import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './socket.types';
import prisma from '../config/prisma';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type IO = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export function registerHandlers(io: IO, socket: AppSocket) {
    const { userId, name } = socket.data;

    // ── Joining the personal room ────────────────────────
    socket.join(`user:${userId}`);
    console.log(`[socket] ${name} connected - socket ${socket.id}`)

    // ── The conversation:join handler ────────────────────────
    socket.on('conversation:join', async ({ conversationId }) => {
        const member = await prisma.conversationMember.findUnique({
            where: {
                conversationId_userId: { conversationId, userId } // conversationId_userId, prisma generate via @@unique([conversationId, userId])
            }
        })

        if (!member) {
            socket.emit('error', { message: 'You are not a member of this conversation.' });
        }

        // join room to receive all
        // event emitted to conversation:${conversationId}
        socket.join(`conversation:${conversationId}`)
        console.log(`[socket] ${name} joined conversation:${conversationId}`)
    })

    // ── The conversation:leave handler ────────────────────────
    socket.on('conversation:leave', async ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`)
        console.log(`[socket] ${name} joined conversation:${conversationId}`)
    })

    // ── message:send ───────────────────────────────────────────
    socket.on('message:send', async ({ conversationId, content }) => {
        if (!content || content.trim().length === 0) {
            socket.emit('error', { message: 'Message can not be empty.' });
            return;
        }

        const member = await prisma.conversationMember.findUnique({
            where: {
                conversationId_userId: { conversationId, userId }
            }
        })

        if (!member) {
            socket.emit('error', { message: 'You are not a member of this conversation.' });
            return;
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

        console.log(`[socket] ${name} → conv:${conversationId}: "${content.trim()}"`)

        // ── disconnect socket ───────────────────────────────────────────
        socket.on('disconnect', (reason) => {
            console.log(`[socket] ${name} disconnected — reason: ${reason}`)
        })
    })
}