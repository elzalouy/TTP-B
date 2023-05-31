"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, printf, errors, json, prettyPrint } = winston_1.format;
function buildDevLogger() {
    const logFormat = printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    });
    return (0, winston_1.createLogger)({
        format: combine(
        // format.colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), logFormat, prettyPrint()),
        transports: [
            new winston_1.transports.Console(),
            new winston_1.transports.File({
                filename: `${__dirname}/dev-logs/error.log`,
                level: "error",
                format: combine(prettyPrint()),
            }),
            new winston_1.transports.File({
                filename: `${__dirname}/dev-logs/combined.log`,
                level: "info",
                format: combine(prettyPrint()),
            }),
        ],
    });
}
exports.default = buildDevLogger();
