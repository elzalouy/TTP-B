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
const techMember_1 = __importDefault(require("../../controllers/techMember"));
const TechMemberReq = class TechMemberReq extends techMember_1.default {
    static handleCreatMember(req, res) {
        const _super = Object.create(null, {
            createNewMember: { get: () => super.createNewMember }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let member = yield _super.createNewMember.call(this, req.body);
                if (member.status === 200) {
                    return res.status(200).send(member);
                }
                else {
                    return res.status(400).send(member);
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateTechMember(req, res) {
        const _super = Object.create(null, {
            updateTechMember: { get: () => super.updateTechMember }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let member = yield _super.updateTechMember.call(this, req.body);
                if (member) {
                    return res.status(200).send((0, successMsg_1.successMsg)('tec_member_updated', 200));
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("tec_member_update_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetTecMember(req, res) {
        const _super = Object.create(null, {
            getTechMember: { get: () => super.getTechMember }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let members = yield _super.getTechMember.call(this, req.query);
                if (members) {
                    return res.status(200).send(members);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("tec_member_get_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = TechMemberReq;
