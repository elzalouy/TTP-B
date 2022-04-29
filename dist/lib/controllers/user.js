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
const validation_1 = require("./../utils/validation");
const logger_1 = __importDefault(require("../../logger"));
const user_1 = __importDefault(require("../dbCalls/user/user"));
const errorUtils_1 = require("../utils/errorUtils");
const mail_1 = __importDefault(require("../services/mail/mail"));
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
    static deleteUserInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__deleteUserDoc(id);
        });
    }
    static getUsersPmOrSA(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__getUsersInfo(data);
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserController.__getUser(id);
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
                if (!token.user) {
                    return (0, errorUtils_1.customeError)("not_valid_token", 400);
                }
                if ((0, validation_1.passwordCheck)(password)) {
                    return (0, errorUtils_1.customeError)("password_length", 400);
                }
                let findUser = yield _super.findUserById.call(this, token.user.id);
                if (!findUser) {
                    return (0, errorUtils_1.customeError)("user_not_exist", 409);
                }
                let oldPasswordCheck = yield (0, auth_1.comparePassword)(oldPassword, findUser.password);
                if (!oldPasswordCheck) {
                    return (0, errorUtils_1.customeError)("wrong_old_password", 409);
                }
                // hash password
                let passwordHash = yield (0, auth_1.hashBassword)(password);
                let user = yield _super.updateUser.call(this, { id: token.user.id, password: passwordHash });
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
                return yield _super.updateUser.call(this, Object.assign({}, data));
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
                const { email /* ,trelloBoardId,trelloMemberId,type='admin' */ } = data;
                // if (passwordCheck(password)) {
                //   return customeError("password_length", 400);
                // }
                if (!(0, validation_1.emailCheck)(email)) {
                    return (0, errorUtils_1.customeError)("email_error", 400);
                }
                let findUser = yield _super.findUser.call(this, { email: email });
                if (findUser) {
                    return (0, errorUtils_1.customeError)("user_already_exist", 400);
                }
                // hash password
                /* let passwordHash: string = await hashBassword(password); */
                // add project manager to specific board
                // if(trelloBoardId &&trelloMemberId && type){
                //      BoardController.addMemberToBoard(trelloBoardId,trelloMemberId,type)
                // }
                let newUser = yield _super.createUser.call(this, Object.assign({}, data /* password: passwordHash  */));
                let token = yield (0, auth_1.createJwtToken)(newUser._id.toString());
                yield (0, mail_1.default)({
                    email: email,
                    subject: "Update Password",
                    token: token,
                    path: "newPassword",
                    body: "Please set your new password using this link to start using your account"
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
