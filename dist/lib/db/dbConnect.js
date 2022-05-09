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
const auth_1 = require("./../services/auth/auth");
const mongoose_1 = require("mongoose");
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../../logger"));
const user_1 = __importDefault(require("../dbCalls/user/user"));
(0, dotenv_1.config)();
const db = process.env.NODE_ENV === "development"
    ? process.env.MONGODB_DEV_URL
    : process.env.MONGODB_PROD_URL;
logger_1.default.info({ db });
const mongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        yield (0, mongoose_1.connect)(db, options);
        console.log("Mongo DB connected");
        // adding superAdmin in db if not exists
        const userInfo = yield user_1.default.findUser({
            email: process.env.SUPER_ADMIN_EMAIL,
        });
        if (!userInfo) {
            let passwordHash = yield (0, auth_1.hashBassword)(process.env.SUPER_ADMIN_PASSWORD);
            const data = {
                name: "abdulaziz qannam",
                email: process.env.SUPER_ADMIN_EMAIL,
                password: passwordHash,
                role: "OM",
            };
            yield user_1.default.createUser(data);
            console.log("Done");
        }
    }
    catch (error) {
        console.error({ mongoDBError: error });
        process.exit(1);
    }
});
exports.default = mongoDB;
