import morgan, { StreamOptions } from 'morgan';
import {logger} from "../helpers/logger";

const stream: StreamOptions = {
    write: (message: string) => logger.http(message.trim()),
}

const skip = () => process.env.NODE_ENV === 'test';

export const httpLogger = morgan(':method :url :status :res[content-length] bytes - :response-time ms', { stream, skip });