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
const errorUtils_1 = require("./../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const team_1 = __importDefault(require("../../controllers/team"));
const TeamReq = class TeamReq extends team_1.default {
    static handleCreateTeam(req, res) {
        const _super = Object.create(null, {
            createTeam: { get: () => super.createTeam }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let team = yield _super.createTeam.call(this, req.body);
                if (team) {
                    return res.status(200).send(team);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_team_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateTeamError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateTeam(req, res) {
        const _super = Object.create(null, {
            updateTeam: { get: () => super.updateTeam }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let teamData = req.body;
                if (!teamData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_team_error", 400));
                }
                let team = yield _super.updateTeam.call(this, teamData);
                if (team) {
                    return res.status(200).send(team);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_team_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateTeamError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteTeam(req, res) {
        const _super = Object.create(null, {
            deleteTeam: { get: () => super.deleteTeam }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.body.id;
                if (!id) {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_team_error", 400));
                }
                let team = yield _super.deleteTeam.call(this, id);
                if (team) {
                    return res.status(200).send((0, successMsg_1.successMsg)("delete_team_success", 200));
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_team_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletTeamError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetTeam(req, res) {
        const _super = Object.create(null, {
            getTeams: { get: () => super.getTeams }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = req.query;
                if (!data) {
                    return res.status(400).send((0, errorUtils_1.customeError)("get_team_error", 400));
                }
                let team = yield _super.getTeams.call(this, data);
                if (team) {
                    return res.status(200).send(team);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("get_team_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletTeamError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = TeamReq;
