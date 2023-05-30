"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trelloApiWithUrl = exports.trelloApi = void 0;
const config_1 = __importDefault(require("config"));
const trelloApi = (route) => {
    let url = `https://api.trello.com/1/${route}key=${config_1.default.get("trelloKey")}&token=${config_1.default.get("trelloToken")}`;
    return url;
};
exports.trelloApi = trelloApi;
const trelloApiWithUrl = (route, params) => {
    let url = `https://api.trello.com/1/${route}/?key=${config_1.default.get("trelloKey")}&token=${config_1.default.get("trelloToken")}&${params}`;
    return url;
};
exports.trelloApiWithUrl = trelloApiWithUrl;
