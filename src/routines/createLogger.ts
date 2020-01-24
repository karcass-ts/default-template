import { createLogger as cl, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const createLogger = () => {
    const logger = cl({
        level: 'error',
        transports: [
            new DailyRotateFile({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '100m',
                maxFiles: '30d',
                format: format.combine(
                    format.timestamp({ format: (() => new Date().toUTCString()) as any }),
                    format.printf(({ message, timestamp }) => `${timestamp}: ${message}`),
                ),
                level: 'error',
            }),
        ],
    });
    process.on('unhandledRejection', reason => {
        throw reason;
    });
    process.on('uncaughtException', error => {
        console.error(error);
        if (error.stack) {
            logger.error(error.stack);
        } else {
            logger.error(error.message);
        }
    });
    return logger;
};
