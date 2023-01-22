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
const validation_1 = require("./../utils/validation");
const successMsg_1 = require("./../utils/successMsg");
const auth_1 = require("../services/auth");
const logger_1 = __importDefault(require("../../logger"));
const user_1 = __importDefault(require("../dbCalls/user/user"));
//NodeMailer
const mail_1 = __importDefault(require("../services/mail/mail"));
const errorUtils_1 = require("../utils/errorUtils");
const User_1 = __importDefault(require("../models/User"));
const AuthController = class AuthController extends user_1.default {
    static signInUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AuthController.__signIn(data);
        });
    }
    static forgetUserPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AuthController.__forgetPassword(email);
        });
    }
    static setNewPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AuthController.__newPasswordSet(token, password);
        });
    }
    static __newPasswordSet(token, password) {
        const _super = Object.create(null, {
            updateUser: { get: () => super.updateUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let verifyToken = yield (0, auth_1.jwtVerify)(token);
                if (!verifyToken) {
                    return (0, errorUtils_1.customeError)("not_valid_token", 400);
                }
                console.log({ password, verifyToken });
                let checkPassword = (0, validation_1.passwordCheck)(password);
                if (checkPassword) {
                    return (0, errorUtils_1.customeError)("password_length", 400);
                }
                let cryptPassword = yield (0, auth_1.hashBassword)(password);
                let user = yield _super.updateUser.call(this, {
                    id: verifyToken.id,
                    password: cryptPassword,
                    verified: true,
                });
                return { user, status: 200 };
            }
            catch (error) {
                logger_1.default.error({ setNewPasswordError: error });
            }
        });
    }
    static __forgetPassword(email) {
        const _super = Object.create(null, {
            findUser: { get: () => super.findUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield _super.findUser.call(this, { email: new RegExp(email, "i") });
                if (!user) {
                    return (0, errorUtils_1.customeError)("no_user_found", 400);
                }
                let token = yield (0, auth_1.createJwtToken)(user);
                yield (0, mail_1.default)({
                    token: token,
                    email: email,
                    subject: "Forgot Password : Reset your old password",
                    path: "resetPassword",
                    image: "http://drive.google.com/uc?export=view&id=1F7ef1MmFkhOOOwPsYjPu-YT9ab51jR1s",
                });
                return (0, successMsg_1.successMsg)("email_sent", 200);
            }
            catch (error) {
                logger_1.default.error({ forgetUserPasswordError: error });
            }
        });
    }
    static __signIn(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = data;
                let user = yield User_1.default.findOne({ email: new RegExp(email, "i") });
                if (user && user._id) {
                    if (user.verified === false) {
                        return null;
                    }
                    let passwordCheck = yield (0, auth_1.comparePassword)(password, user.password);
                    if (passwordCheck === false) {
                        return null;
                    }
                    let getToken = (0, auth_1.createJwtToken)(user);
                    let { _id, email: mail, role, type, image, trelloBoardId, trelloMemberId, name, } = user;
                    console.log({ user });
                    return {
                        _id,
                        email: mail,
                        role,
                        type,
                        image,
                        name,
                        trelloBoardId,
                        trelloMemberId,
                        token: getToken,
                    };
                }
                else
                    return null;
            }
            catch (error) {
                logger_1.default.error({ signInError: error });
            }
        });
    }
};
exports.default = AuthController;
