"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRoutesQueue = void 0;
const queue_1 = __importDefault(require("queue"));
exports.taskRoutesQueue = (0, queue_1.default)({
    results: [],
    autostart: true,
    concurrency: 1,
});
