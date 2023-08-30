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
const mail_1 = __importDefault(require("../services/mail/mail"));
const logger_1 = __importDefault(require("../../logger"));
const user_1 = __importDefault(require("../dbCalls/user/user"));
const errorUtils_1 = require("../utils/errorUtils");
const validation_1 = require("./../utils/validation");
const auth_1 = require("../services/auth");
const UserController = class UserController extends user_1.default {
    static addUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__addNewUser(data);
        });
    }
    static updateUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__updateUserData(data);
        });
    }
    static updatePassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__updateUserPassword(data);
        });
    }
    static resetPassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__resetUserPassword(data);
        });
    }
    static deleteUserInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__deleteUserDoc(id);
        });
    }
    static getUsers(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__getUsersInfo(data);
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__getUser(id);
        });
    }
    static resendNewUserMail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__resendNewUserMail(id);
        });
    }
    static __resendNewUserMail(id) {
        const _super = Object.create(null, {
            findUserById: { get: () => super.findUserById }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield _super.findUserById.call(this, id);
                let token = yield (0, auth_1.createJwtToken)(user);
                yield (0, mail_1.default)({
                    email: user.email,
                    subject: "This is a reminder to set a New Password for your TTP account",
                    token: token,
                    path: "newPassword",
                    image: "http://drive.google.com/uc?export=view&id=1bfh1fwvqg9JegwTghhuYWIhUS0wGIryj",
                });
            }
            catch (error) {
                logger_1.default.error({ getUsers: error });
            }
        });
    }
    static __getUser(id) {
        const _super = Object.create(null, {
            findUserById: { get: () => super.findUserById }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield _super.findUserById.call(this, id);
                return user;
            }
            catch (error) {
                logger_1.default.error({ getUsers: error });
            }
        });
    }
    static __getUsersInfo(data) {
        const _super = Object.create(null, {
            getUsers: { get: () => super.getUsers }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let findUsers = yield _super.getUsers.call(this, data);
                return findUsers;
            }
            catch (error) {
                logger_1.default.error({ getUsersError: error });
            }
        });
    }
    static __deleteUserDoc(id) {
        const _super = Object.create(null, {
            deleteUser: { get: () => super.deleteUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deletedUser = yield _super.deleteUser.call(this, id);
                return deletedUser;
            }
            catch (error) {
                logger_1.default.error({ deleteUserInfoError: error });
            }
        });
    }
    static __updateUserPassword(data) {
        const _super = Object.create(null, {
            findUserById: { get: () => super.findUserById },
            updateUser: { get: () => super.updateUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, password, oldPassword } = data;
                const token = yield (0, auth_1.jwtVerify)(id);
                if (!token.id) {
                    return (0, errorUtils_1.customeError)("not_valid_token", 400);
                }
                if ((0, validation_1.passwordCheck)(password)) {
                    return (0, errorUtils_1.customeError)("password_length", 400);
                }
                let findUser = yield _super.findUserById.call(this, token.id);
                if (!findUser) {
                    return (0, errorUtils_1.customeError)("user_not_exist", 409);
                }
                let oldPasswordCheck = yield (0, auth_1.comparePassword)(oldPassword, findUser.password);
                if (!oldPasswordCheck) {
                    return (0, errorUtils_1.customeError)("wrong_old_password", 409);
                }
                // hash password
                let passwordHash = yield (0, auth_1.hashBassword)(password);
                let user = yield _super.updateUser.call(this, {
                    id: token.id,
                    password: passwordHash,
                    verified: true,
                });
                return user;
            }
            catch (error) {
                logger_1.default.error({ updatePasswordError: error });
            }
        });
    }
    static __resetUserPassword(data) {
        const _super = Object.create(null, {
            findUserById: { get: () => super.findUserById },
            updateUser: { get: () => super.updateUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, password } = data;
                const token = yield (0, auth_1.jwtVerify)(id);
                if (!token.id) {
                    return (0, errorUtils_1.customeError)("not_valid_token", 400);
                }
                if ((0, validation_1.passwordCheck)(password)) {
                    console.log("password pattern error");
                    return (0, errorUtils_1.customeError)("password_length", 400);
                }
                let findUser = yield _super.findUserById.call(this, token.id);
                if (!findUser) {
                    return (0, errorUtils_1.customeError)("user_not_exist", 409);
                }
                // hash password
                let passwordHash = yield (0, auth_1.hashBassword)(password);
                let user = yield _super.updateUser.call(this, {
                    id: token.id,
                    password: passwordHash,
                    verified: true,
                });
                return user;
            }
            catch (error) {
                logger_1.default.error({ updatePasswordError: error });
            }
        });
    }
    static __updateUserData(data) {
        const _super = Object.create(null, {
            findUserById: { get: () => super.findUserById },
            updateUser: { get: () => super.updateUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = data;
                let findUser = yield _super.findUserById.call(this, id);
                if (!findUser) {
                    return null;
                }
                let token = yield (0, auth_1.createJwtToken)(findUser);
                if (data.email) {
                    (0, mail_1.default)({
                        email: data.email,
                        subject: "Please set your new password",
                        token: token,
                        path: "newPassword",
                        image: "http://drive.google.com/uc?export=view&id=1bfh1fwvqg9JegwTghhuYWIhUS0wGIryj",
                    });
                }
                return yield _super.updateUser.call(this, Object.assign(Object.assign({}, data), { verified: false, password: null }));
            }
            catch (error) {
                logger_1.default.error({ updateUserInfoError: error });
            }
        });
    }
    static __addNewUser(data) {
        const _super = Object.create(null, {
            findUser: { get: () => super.findUser },
            createUser: { get: () => super.createUser }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = data;
                if (!(0, validation_1.emailCheck)(email)) {
                    return (0, errorUtils_1.customeError)("email_error", 400);
                }
                let findUser = yield _super.findUser.call(this, {
                    email: new RegExp(email, "i"),
                });
                if (findUser) {
                    return (0, errorUtils_1.customeError)("user_already_exist", 400);
                }
                let newUser = yield _super.createUser.call(this, Object.assign({}, data));
                let token = yield (0, auth_1.createJwtToken)(newUser);
                (0, mail_1.default)({
                    email: email,
                    subject: "Please update your new password",
                    token: token,
                    path: "newPassword",
                    image: "http://drive.google.com/uc?export=view&id=1bfh1fwvqg9JegwTghhuYWIhUS0wGIryj",
                });
                return newUser;
            }
            catch (error) {
                logger_1.default.error({ addNewUserError: error });
            }
        });
    }
};
exports.default = UserController;
