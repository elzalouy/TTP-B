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
const logger_1 = __importDefault(require("../../../logger"));
const errorUtils_1 = require("../../utils/errorUtils");
const auth_1 = __importDefault(require("../../controllers/auth"));
const AuthReq = class AuthReq extends auth_1.default {
    static handleSignInUser(req, res) {
        const _super = Object.create(null, {
            signInUser: { get: () => super.signInUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.body;
                if (userData) {
                    let user = yield _super.signInUser.call(this, userData);
                    if (user.userData) {
                        const { token, userData } = user;
                        res.cookie("token", `Bearer ${token}`, {
                            httpOnly: true,
                            // maxAge:24 * 60 * 60,
                            secure: process.env.NODE_ENV === "development" ? false : true,
                        });
                        return res.status(200).send(userData);
                    }
                    else {
                        return res.status(400).send((0, errorUtils_1.customeError)("credential_error", 400));
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("credential_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleSignInUserError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleLogoutUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("token");
                return res.status(200).send();
            }
            catch (error) {
                logger_1.default.error({ handleLogoutUserError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUserForgetPassword(req, res) {
        const _super = Object.create(null, {
            forgetUserPassword: { get: () => super.forgetUserPassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.body.email;
                if (userData) {
                    let user = yield _super.forgetUserPassword.call(this, userData);
                    if (user.status === 200) {
                        return res.status(200).send(user);
                    }
                    else {
                        return res.status(400).send(user);
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("credential_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUserForgetPasswordError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateUserPassword(req, res) {
        const _super = Object.create(null, {
            setNewPassword: { get: () => super.setNewPassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.body;
                if (userData) {
                    const { token, password } = userData;
                    let user = yield _super.setNewPassword.call(this, token, password);
                    if (user.status === 200) {
                        return res.status(200).send(user);
                    }
                    else {
                        return res.status(400).send(user);
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("credential_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateUserPasswordError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = AuthReq;
