import prisma from "../../lib/prisma";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
import { MESSAGE_EVENTS } from "../modules/message/message.events";
import { MESSAGE_STATUS } from "../modules/message/message.types";

export async function deliverPendingMessages(socket: AuthenticatedSocket): Promise<void> {
    const pendingMessages = await prisma.messageStatus.findMany({
        where: {
            recipientId: socket.userId,
            statusType: MESSAGE_STATUS.PENDING,
        },
        include: {
            message: {
                include: {
                    sender: {
                        select: { id: true, name: true }
                    }
                }
            }
        },
        orderBy: {
            message: {
                createdAt: 'asc'
            }
        }
    });

    if (pendingMessages.length > 0) {
        await prisma.messageStatus.updateMany({
            where: {
                recipientId: socket.userId,
                statusType: MESSAGE_STATUS.PENDING,
            },
            data: {
                statusType: MESSAGE_STATUS.READ
            }
        })
        socket.emit(MESSAGE_EVENTS.PENDING, pendingMessages);
    }
}