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
const logger_1 = __importDefault(require("../../logger"));
const team_1 = __importDefault(require("../dbCalls/teams/team"));
const TeamController = class TeamController extends team_1.default {
    static createTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamController.__createNewTeam(data);
        });
    }
    static updateTeam(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamController.__updateTeamData(data);
        });
    }
    static deleteTeam(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamController.__deleteTeamData(id);
        });
    }
    static getTeams(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TeamController.__getTeamData(data);
        });
    }
    static __getTeamData(data) {
        const _super = Object.create(null, {
            getTeamData: { get: () => super.getTeamData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let teams = yield _super.getTeamData.call(this, data);
                return teams;
            }
            catch (error) {
                logger_1.default.error({ getTeamsError: error });
            }
        });
    }
    static __deleteTeamData(id) {
        const _super = Object.create(null, {
            deleteTeamDB: { get: () => super.deleteTeamDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteTeam = yield _super.deleteTeamDB.call(this, id);
                return deleteTeam;
            }
            catch (error) {
                logger_1.default.error({ deleteTeamError: error });
            }
        });
    }
    static __updateTeamData(data) {
        const _super = Object.create(null, {
            updatedbTeam: { get: () => super.updatedbTeam }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let teamUpdate = yield _super.updatedbTeam.call(this, data);
                return teamUpdate;
            }
            catch (error) {
                logger_1.default.error({ updateTeamError: error });
            }
        });
    }
    static __createNewTeam(data) {
        const _super = Object.create(null, {
            createdbTeam: { get: () => super.createdbTeam }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let team = yield _super.createdbTeam.call(this, data);
                if (!team) {
                    return null;
                }
                return team;
            }
            catch (error) {
                logger_1.default.error({ createTeamError: error });
            }
        });
    }
};
exports.default = TeamController;
