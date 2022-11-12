"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
function prod(app) {
    function shouldCompress(req, res) {
        if (req.headers["x-no-compression"]) {
            // don't compress responses with this request header
            return false;
        }
        // fallback to standard filter function
        return compression_1.default.filter(req, res);
    }
    app.use((0, compression_1.default)({ filter: shouldCompress }));
    app.use((0, helmet_1.default)());
}
exports.default = prod;
