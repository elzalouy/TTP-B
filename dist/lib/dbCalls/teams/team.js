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
const Team_1 = __importDefault(require("../../models/Team"));
const TeamBD = class TeamBD {
    static createdbTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamBD.__addNewTeam(data);
        });
    }
    static updatedbTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamBD.__updateTeam(data);
        });
    }
    static deleteTeamDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamBD.__deleteTeam(id);
        });
    }
    static getTeamData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamBD.__getTeam(data);
        });
    }
    static __getTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let team = yield Team_1.default.find(data).lean();
                return team;
            }
            catch (error) {
                logger_1.default.error({ getTeamDataError: error });
            }
        });
    }
    static __deleteTeam(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deletedTeam = yield Team_1.default.findOneAndDelete({ _id: id });
                return deletedTeam;
            }
            catch (error) {
                logger_1.default.error({ deleteTeamError: error });
            }
        });
    }
    static __updateTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data.id;
                delete data.id;
                let team = yield Team_1.default.findByIdAndUpdate({ _id: id }, Object.assign({}, data), { new: true, lean: true });
                return team;
            }
            catch (error) {
                logger_1.default.error({ updatedbTeamError: error });
            }
        });
    }
    static __addNewTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let team = new Team_1.default(data);
                yield team.save();
                return team;
            }
            catch (error) {
                logger_1.default.error({ createTeamError: error });
            }
        });
    }
};
exports.default = TeamBD;
