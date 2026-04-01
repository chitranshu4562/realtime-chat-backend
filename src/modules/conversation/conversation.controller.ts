import { NextFunction, Request, Response } from "express";
import * as conversationService from "./conversation.service";
import {apiOkResponse} from "../../helpers/api.response";

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await conversationService.createConversation(req.user!.userId, req.body);
        apiOkResponse(res, 'Conversation created', result);
    } catch (err) {
        next(err);
    }
}