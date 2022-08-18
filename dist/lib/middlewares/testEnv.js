"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let envName = config_1.default.get("name");
        if (envName === "TTP development" && process.env.NODE_ENV)
            next();
        else
            return res
                .status(400)
                .send("Dropping the collection cannot be executed if node environment wasn't in testing mode");
    }
    catch (error) {
        res.status(401).send("Invalid Token");
    }
});
