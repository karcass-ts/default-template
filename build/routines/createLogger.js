"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
exports.createLogger = () => {
    const logger = winston_1.createLogger({
        level: 'error',
        transports: [
            new winston_daily_rotate_file_1.default({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '100m',
                maxFiles: '30d',
                format: winston_1.format.combine(winston_1.format.timestamp({ format: (() => new Date().toUTCString()) }), winston_1.format.printf(({ message, timestamp }) => `${timestamp}: ${message}`)),
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
        }
        else {
            logger.error(error.message);
        }
    });
    return logger;
};
//# sourceMappingURL=createLogger.js.map