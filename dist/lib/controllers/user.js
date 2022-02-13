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
const boards_1 = __importDefault(require("./boards"));
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
                if ((0, validation_1.passwordCheck)(password)) {
                    return (0, errorUtils_1.customeError)("password_length", 400);
                }
                let findUser = yield _super.findUserById.call(this, id);
                if (!findUser) {
                    return (0, errorUtils_1.customeError)("user_not_exsit", 409);
                }
                let oldPasswordCheck = yield (0, auth_1.comparePassword)(oldPassword, findUser.password);
                if (!oldPasswordCheck) {
                    return (0, errorUtils_1.customeError)("wrong_old_password", 409);
                }
                // hash password
                let passwordHash = yield (0, auth_1.hashBassword)(password);
                let user = yield _super.updateUser.call(this, { id, password: passwordHash });
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
                const { id, email } = data;
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
                const { email, password, trelloBoardId, trelloMemberId, type = 'admin' } = data;
                if ((0, validation_1.passwordCheck)(password)) {
                    return (0, errorUtils_1.customeError)("password_length", 400);
                }
                if (!(0, validation_1.emailCheck)(email)) {
                    return (0, errorUtils_1.customeError)("email_error", 400);
                }
                let findUser = yield _super.findUser.call(this, { email: email });
                if (findUser) {
                    return (0, errorUtils_1.customeError)("user_already_exsit", 409);
                }
                // hash password
                let passwordHash = yield (0, auth_1.hashBassword)(password);
                // add project manager to specific board
                if (trelloBoardId && trelloMemberId && type) {
                    boards_1.default.addMemberToBoard(trelloBoardId, trelloMemberId, type);
                }
                return yield _super.createUser.call(this, Object.assign(Object.assign({}, data), { password: passwordHash }));
            }
            catch (error) {
                logger_1.default.error({ addNewUserError: error });
            }
        });
    }
};
exports.default = UserController;
