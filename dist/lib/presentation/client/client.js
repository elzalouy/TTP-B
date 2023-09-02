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
const client_1 = __importDefault(require("../../controllers/client"));
const successMsg_1 = require("../../utils/successMsg");
const errorUtils_1 = require("../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const index_1 = require("../../../index");
const ClientReq = class ClientReq extends client_1.default {
    static handleCreateClient(req, res) {
        const _super = Object.create(null, {
            createClient: { get: () => super.createClient }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = req.files;
                if (file.image) {
                    req.body.image = file.image[0].location;
                }
                let Client = yield _super.createClient.call(this, req.body);
                if (Client) {
                    index_1.io.sockets.emit("create-client", Client);
                    return res.status(200).send(Client);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_client_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateClientDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateClient(req, res) {
        const _super = Object.create(null, {
            updateClient: { get: () => super.updateClient }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let clientData = req.body;
                let file = req.files;
                if (file.image && file.image[0]) {
                    clientData.image = file.image[0].location;
                }
                logger_1.default.warning({ clientData });
                if (!clientData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_client_error", 400));
                }
                let Client = yield _super.updateClient.call(this, clientData);
                if (Client) {
                    return res.status(200).send(Client);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_client_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateClientDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteClient(req, res) {
        const _super = Object.create(null, {
            deleteClient: { get: () => super.deleteClient }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.query.id;
                if (!id) {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_client_error", 400));
                }
                let Client = yield _super.deleteClient.call(this, id);
                if (Client) {
                    return res.status(200).send((0, successMsg_1.successMsg)("delete_client_success", 200));
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_client_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletClientDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetAllClients(req, res) {
        const _super = Object.create(null, {
            getAllClients: { get: () => super.getAllClients }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let Client = yield _super.getAllClients.call(this);
                if (Client) {
                    return res.status(200).send(Client);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("get_client_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletClientDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = ClientReq;
