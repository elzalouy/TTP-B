"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localize = void 0;
const config_1 = __importDefault(require("../i18n/config"));
const localize = (key) => {
    return config_1.default.__(key);
};
exports.localize = localize;
