"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function buildLogger() {
    console.log({ ErrorLogFile: `${__dirname}/error.log` });
    const logger = (0, winston_1.createLogger)({
        format: winston_1.format.json(),
        transports: [
            new winston_1.transports.File({}),
            new winston_1.transports.File({
                filename: `error.log`,
                level: "error",
                format: winston_1.format.json(),
            }),
            new winston_1.transports.File({
                filename: `debug.log`,
                level: "debug",
                format: winston_1.format.json(),
            }),
            new winston_1.transports.File({
                filename: `warning.log`,
                level: "warning",
                format: winston_1.format.json(),
            }),
        ],
    });
    if (process.env.NODE_ENV === "production")
        logger.add(new winston_1.transports.Console());
    return logger;
}
const logger = buildLogger();
exports.default = logger;
