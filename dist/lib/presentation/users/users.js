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
const successMsg_1 = require("./../../utils/successMsg");
const user_1 = __importDefault(require("../../controllers/user"));
const logger_1 = __importDefault(require("../../../logger"));
const errorUtils_1 = require("../../utils/errorUtils");
const UserReq = class UserReq extends user_1.default {
    static handleGetUserInfo(req, res) {
        const _super = Object.create(null, {
            getUserById: { get: () => super.getUserById }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.query.id;
                let userData = yield _super.getUserById.call(this, id);
                return res.status(200).send(userData);
            }
            catch (error) {
                logger_1.default.error({ handleGetUserInfoError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleCreatUser(req, res) {
        const _super = Object.create(null, {
            addUser: { get: () => super.addUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.body;
                if (userData) {
                    let user = yield _super.addUser.call(this, userData);
                    if (user) {
                        return res.send(user);
                    }
                    else {
                        return res.status(400).send((0, errorUtils_1.customeError)("missing_data", 400));
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("missing_data", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreatUserError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateUser(req, res) {
        const _super = Object.create(null, {
            updateUser: { get: () => super.updateUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.body;
                if (userData) {
                    let user = yield _super.updateUser.call(this, userData);
                    if (user) {
                        return res.send(user);
                    }
                    else {
                        res.status(409).send((0, errorUtils_1.customeError)("user_not_exist", 409));
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("missing_data", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateUser: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdatePassword(req, res) {
        const _super = Object.create(null, {
            updatePassword: { get: () => super.updatePassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.body;
                logger_1.default.info({ userData });
                if (userData) {
                    let user = yield _super.updatePassword.call(this, userData);
                    if (user) {
                        return res.send(user);
                    }
                    else {
                        res.status(409).send((0, errorUtils_1.customeError)("user_not_exist", 409));
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("missing_data", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdatePassword: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteUser(req, res) {
        const _super = Object.create(null, {
            deleteUserInfo: { get: () => super.deleteUserInfo }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let _id = req.query._id;
                if (_id && typeof _id === "string") {
                    let user = yield _super.deleteUserInfo.call(this, _id);
                    if (user) {
                        return res.status(200).send((0, successMsg_1.successMsg)("delete_success", 200));
                    }
                    else {
                        res.status(400).send((0, errorUtils_1.customeError)("user_not_exist", 400));
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("missing_data", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdatePassword: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetUserPmOrSA(req, res) {
        const _super = Object.create(null, {
            getUsersPmOrSA: { get: () => super.getUsersPmOrSA }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userData = req.query;
                if (userData) {
                    let user = yield _super.getUsersPmOrSA.call(this, userData);
                    if (user) {
                        return res.status(200).send(user);
                    }
                    else {
                        res.status(409).send((0, errorUtils_1.customeError)("user_not_exist", 409));
                    }
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("missing_data", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetUserPmOrSAError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = UserReq;
