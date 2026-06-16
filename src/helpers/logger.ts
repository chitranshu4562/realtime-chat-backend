import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) => {
        return stack ? `[${timestamp}] ${level}: ${message}\n${stack}` : `[${timestamp}] ${level}: ${message}`;
    })
)

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    winston.format.json() // structured JSON for log aggregators
);

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
        ...(!isProduction ? [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
        ] : []),
    ],
});