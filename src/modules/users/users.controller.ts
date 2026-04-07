import { NextFunction, Request, Response } from "express";
import * as usersService from "./users.service";
import { apiOkResponse } from "../../helpers/api.response";

export const users = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loggedInUserId = req.user!.userId; // from auth middleware
        const { search, cursor, limit } = req.query;
        const result = await usersService.getUsers({
            loggedInUserId,
            search: search as string | undefined,
            cursor: cursor as number | undefined,
            limit: limit as number | undefined
        });
        apiOkResponse(res, 'Users retrieved successfully', result);
    } catch (err) {
        next(err);
    }
}