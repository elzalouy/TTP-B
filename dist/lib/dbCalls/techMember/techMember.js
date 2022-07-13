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
const Teams_1 = __importDefault(require("../../models/Teams"));
const TechMemberDB = class TechMemberDB {
    static createTechMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberDB.__addTechMember(data);
        });
    }
    static updateTechMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberDB.__updateMember(data);
        });
    }
    static getTechMemberDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberDB.__getTechMmber(data);
        });
    }
    static updateTechMembersDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberDB.__updateTechMembersDB(data);
        });
    }
    static deleteTechMemberDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberDB.__deleteTechMemberDB(data);
        });
    }
    static __updateTechMembersDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ids = data.ids;
                delete data.ids;
                let techMembers = yield Teams_1.default.updateMany({ id: { $in: ids } }, Object.assign({}, data), { multi: true });
                return techMembers;
            }
            catch (error) {
                logger_1.default.error({ updateTechMembersDBDBError: error });
            }
        });
    }
    static __getTechMmber(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let techMember = yield Teams_1.default.find(data).lean();
                return techMember;
            }
            catch (error) {
                logger_1.default.error({ getTechMemberDBError: error });
            }
        });
    }
    static __updateMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data.id;
                delete data.id;
                logger_1.default.info({ data });
                let techMember = yield Teams_1.default.findOneAndUpdate({ _id: id }, Object.assign({}, data), { new: true, lean: true });
                return techMember;
            }
            catch (error) {
                logger_1.default.error({ updateTechMemberError: error });
            }
        });
    }
    static __addTechMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let techMember = new Teams_1.default(data);
                yield techMember.save();
                return techMember;
            }
            catch (error) {
                logger_1.default.error({ addTechMemberError: error });
            }
        });
    }
    static __deleteTechMemberDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteResult = yield Teams_1.default.deleteMany(data);
                if (deleteResult && deleteResult.deletedCount > 0)
                    return deleteResult;
                else
                    return "Delete result is 0 document";
            }
            catch (error) {
                logger_1.default.error({ deleteTechMemberError: error });
            }
        });
    }
};
exports.default = TechMemberDB;
