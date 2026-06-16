import { NextFunction, Request, Response } from "express";
import { GetMessageDetailsParams, GetMessagesParams } from "./message.types";
import * as messageService from "./message.service";
import { apiOkResponse } from "../../helpers/api.response";

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { conversationId } = req.parsedQuery as GetMessagesParams;
        const result = await messageService.fetchMessages(conversationId, req.user!.userId);
        apiOkResponse(res, 'Messages fetched successfully', result);
    } catch (err) {
        next(err);
    }
}

export const getMessageDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { messageId } = req.parsedQuery as GetMessageDetailsParams;
        const result = await messageService.fetchMessageDetails(messageId, req.user!.userId);
        apiOkResponse(res, 'Message details fetched successfully', result);
    } catch (err) {
        next(err);
    }
}