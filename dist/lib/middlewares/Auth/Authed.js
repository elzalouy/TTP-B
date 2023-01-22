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
const user_1 = __importDefault(require("../../controllers/user"));
const auth_1 = require("../../services/auth");
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // missing or bad authentication => 401 unauthorized
        const token = req.header("Authorization");
        if (!token)
            return res.status(401).send("Access denied, No token provided");
        const decoded = yield (0, auth_1.jwtVerify)(token);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            return res.status(401).send("Invalid Token");
        }
        else {
            let user = yield user_1.default.findUserById(decoded.id);
            if (user) {
                next();
            }
            else
                return res
                    .status(401)
                    .send("Your account is not existed anymore in our database");
        }
    }
    catch (error) {
        res.status(401).send("Invalid Token");
    }
});
