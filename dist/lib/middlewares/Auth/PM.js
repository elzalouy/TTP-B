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
    try {
        const token = req.header("authorization");
        // missing or bad authentication => 401 unauthorized
        // not authorized to perform a task => 403 forbidden
        if (!token)
            return res.status(401).send("Access denied, No token provided");
        const decoded = yield (0, auth_1.jwtVerify)(token);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            return res.status(401).send("Invalid Token");
        }
        if (decoded.role !== "PM")
            return res
                .status(401)
                .send("Un-authenticated, you should be authenticated to do this job ");
        next();
    }
    catch (error) {
        res.status(401).send("Invalid Token");
    }
});
