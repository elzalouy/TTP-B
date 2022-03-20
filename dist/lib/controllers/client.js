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
const client_1 = __importDefault(require("../dbCalls/client/client"));
const logger_1 = __importDefault(require("../../logger"));
const ClientController = class ClientController extends client_1.default {
    static createClient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientController.__createClient(data);
        });
    }
    static updateClient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientController.__updateClient(data);
        });
    }
    static getAllClients() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientController.__getAllClients();
        });
    }
    static deleteClient(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientController.__deleteClient(id);
        });
    }
    static __deleteClient(id) {
        const _super = Object.create(null, {
            deleteClientDB: { get: () => super.deleteClientDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = yield _super.deleteClientDB.call(this, id);
                return client;
            }
            catch (error) {
                logger_1.default.error({ deletClientControllerError: error });
            }
        });
    }
    static __getAllClients() {
        const _super = Object.create(null, {
            getAllClientsDB: { get: () => super.getAllClientsDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = yield _super.getAllClientsDB.call(this);
                return client;
            }
            catch (error) {
                logger_1.default.error({ getClientControllerError: error });
            }
        });
    }
    static __updateClient(data) {
        const _super = Object.create(null, {
            updateClientDB: { get: () => super.updateClientDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = yield _super.updateClientDB.call(this, data);
                return client;
            }
            catch (error) {
                logger_1.default.error({ updateClientControllerError: error });
            }
        });
    }
    static __createClient(data) {
        const _super = Object.create(null, {
            createClientDB: { get: () => super.createClientDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = _super.createClientDB.call(this, data);
                return client;
            }
            catch (error) {
                logger_1.default.error({ createClientError: error });
            }
        });
    }
};
exports.default = ClientController;
