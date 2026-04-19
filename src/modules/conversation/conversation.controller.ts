import { NextFunction, Request, Response } from "express";
import * as conversationService from "./conversation.service";
import { apiOkResponse } from "../../helpers/api.response";
import { GetConversationsParams } from "./conversation.schema";

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await conversationService.createConversation({ loggedInUserId: req.user!.userId, ...req.body });
        apiOkResponse(res, 'Conversation created', result);
    } catch (err) {
        next(err);
    }
}

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.parsedQuery as GetConversationsParams;
        const result = await conversationService.fetchConversations({ loggedInUserId: req.user!.userId, ...query });
        apiOkResponse(res, 'List fetched successfully', result);
    } catch (err) {
        next(err);
    }
}