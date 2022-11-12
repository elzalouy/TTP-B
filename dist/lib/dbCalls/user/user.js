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
const User_1 = __importDefault(require("../../models/User"));
const UserDB = class UserDB {
    static findUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getUserData(data);
        });
    }
    static createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__createNewUser(data);
        });
    }
    static updateUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__updateUserInfo(data);
        });
    }
    static findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__findById(id);
        });
    }
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__deleteUserData(id);
        });
    }
    static getUsers(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getUsersData(data);
        });
    }
    static __getUsersData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield User_1.default.find(data)
                    .select("_id name email verified role image trelloMemberId userTeams")
                    .lean();
                return user;
            }
            catch (error) {
                logger_1.default.error({ getUserError: error });
            }
        });
    }
    static __deleteUserData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteUser = yield User_1.default.findOneAndDelete({ _id: id });
                return deleteUser;
            }
            catch (error) {
                logger_1.default.error({ deleteUserError: error });
            }
        });
    }
    static __updateUserInfo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data.id;
                delete data.id;
                let user = yield User_1.default.findOneAndUpdate({ _id: id }, Object.assign({}, data), { new: true, lean: true });
                return user;
            }
            catch (error) {
                logger_1.default.error({ updateUserDataError: error });
            }
        });
    }
    static __findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield User_1.default.findById({ _id: id }).lean();
                return user;
            }
            catch (error) {
                logger_1.default.error({ findUserById: error });
            }
        });
    }
    static __getUserData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield User_1.default.findOne(Object.assign({}, data)).lean();
                return user;
            }
            catch (error) {
                logger_1.default.error({ findUserError: error });
            }
        });
    }
    static __createNewUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = new User_1.default(Object.assign(Object.assign({}, data), { verified: data.verified ? data.verified : false }));
                yield user.save();
                return user;
            }
            catch (error) {
                logger_1.default.error({ createUserError: error });
            }
        });
    }
};
exports.default = UserDB;
