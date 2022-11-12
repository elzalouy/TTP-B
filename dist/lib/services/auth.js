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
exports.jwtVerify = exports.createJwtToken = exports.comparePassword = exports.hashBassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const hashBassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRound = 10;
    const salt = yield bcrypt_1.default.genSalt(saltRound);
    const hash = yield bcrypt_1.default.hash(password, salt);
    return hash;
});
exports.hashBassword = hashBassword;
const comparePassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    const validPassword = yield bcrypt_1.default.compare(password, hash);
    return validPassword;
});
exports.comparePassword = comparePassword;
const createJwtToken = (user) => {
    let jwtGenerate = jsonwebtoken_1.default.sign({
        id: user._id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRETE, {
        expiresIn: 30 * 24 * 60 * 60,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUE,
    });
    return jwtGenerate;
};
exports.createJwtToken = createJwtToken;
const jwtVerify = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        token = token.split(" ")[1];
        let jwtVerify = yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRETE, {
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUE,
        });
        return jwtVerify;
    }
    catch (error) {
        return error;
    }
});
exports.jwtVerify = jwtVerify;
