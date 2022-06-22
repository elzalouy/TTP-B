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
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../services/auth");
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // missing or bad authentication => 401 unauthorized
        const token = req.header("Authorization");
        if (!token)
            return res.status(401).send("Access denied, No token provided");
        const decoded = yield (0, auth_1.jwtVerify)(token);
        if (!((_a = decoded === null || decoded === void 0 ? void 0 : decoded.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).send("Invalid Token");
        }
        next();
    }
    catch (error) {
        res.status(401).send("Invalid Token");
    }
});
