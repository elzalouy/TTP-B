"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, errors, json, prettyPrint } = winston_1.format;
function buildProdLogger() {
    return (0, winston_1.createLogger)({
        format: combine(timestamp(), errors({ stack: true }), prettyPrint()),
        transports: [
            new winston_1.transports.Console(),
            new winston_1.transports.File({
                filename: `${__dirname}/prod-logs/error.log`,
                level: "error",
                format: json(),
            }),
            new winston_1.transports.File({
                filename: `${__dirname}/prod-logs/debug.log`,
                level: "debug",
                format: combine(prettyPrint()),
            }),
            new winston_1.transports.File({
                filename: `${__dirname}/prod-logs/combined.log`,
                format: combine(prettyPrint()),
            }),
        ],
    });
}
exports.default = buildProdLogger();
