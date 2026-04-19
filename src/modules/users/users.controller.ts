import { NextFunction, Request, Response } from "express";
import * as usersService from "./users.service";
import { apiOkResponse } from "../../helpers/api.response";
import type { UsersParams } from "./users.schema";

type UsersListRequest = Request & { parsedQuery: UsersParams };

export const users = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loggedInUserId = req.user!.userId; // from auth middleware
        const { search, cursor, limit } = (req as UsersListRequest).parsedQuery;
        const result = await usersService.getUsers({
            loggedInUserId,
            search,
            cursor,
            limit,
        });
        apiOkResponse(res, 'Users retrieved successfully', result);
    } catch (err) {
        next(err);
    }
}