"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trelloApi = void 0;
const config_1 = __importDefault(require("config"));
const trelloApi = (service) => {
    let url = `https://api.trello.com/1/${service}key=${config_1.default.get("trellKey")}&token=${config_1.default.get("trelloApiKey")}`;
    return url;
};
exports.trelloApi = trelloApi;
