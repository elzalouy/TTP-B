"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const dev_logger_1 = __importDefault(require("./dev-logger"));
const prod_logger_1 = __importDefault(require("./prod-logger"));
(0, dotenv_1.config)();
let logger = null;
if (process.env.NODE_ENV === "development") {
    logger = dev_logger_1.default;
}
else {
    logger = prod_logger_1.default;
}
exports.default = logger;
