import { NextFunction, Request, Response } from "express";
import * as conversationService from "./conversation.service";
import { ApiResponse } from "../../shared/ApiResponse";

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await conversationService.createConversation(req.user!.userId, req.body);
        ApiResponse.created(res, 'Conversation created', result);
    } catch (err) {
        next(err);
    }
}