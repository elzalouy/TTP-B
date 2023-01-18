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
const Client_1 = __importDefault(require("../../models/Client"));
const logger_1 = __importDefault(require("../../../logger"));
const Project_1 = __importDefault(require("../../models/Project"));
const ClientDB = class ClientDB {
    static createClientDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientDB.__createClient(data);
        });
    }
    static updateClientDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientDB.__updateClient(data);
        });
    }
    static getAllClientsDB() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientDB.__getAllClients();
        });
    }
    static deleteClientDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientDB.__deleteClient(id);
        });
    }
    static updateClientProcedure(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ClientDB.__updateClientProcedureDB(id);
        });
    }
    static __deleteClient(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = yield Client_1.default.findByIdAndDelete({ _id: id });
                return client;
            }
            catch (error) {
                logger_1.default.error({ deletclientDBError: error });
            }
        });
    }
    static __getAllClients() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = yield Client_1.default.find().lean();
                return client;
            }
            catch (error) {
                logger_1.default.error({ getclientDBError: error });
            }
        });
    }
    static __updateClient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data._id;
                delete data._id;
                let client = yield Client_1.default.findByIdAndUpdate({ _id: id }, Object.assign({}, data), { new: true });
                return client;
            }
            catch (error) {
                logger_1.default.error({ updateClientDBError: error });
            }
        });
    }
    static __createClient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = new Client_1.default(data);
                yield client.save();
                return client;
            }
            catch (error) {
                logger_1.default.error({ createclientDBError: error });
            }
        });
    }
    static __updateClientProcedureDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let client = yield Client_1.default.findById(id);
                if (client) {
                    let projects = yield Project_1.default.find({ clientId: id }).lean();
                    if (projects) {
                        let inProgress = projects.filter((item) => item.projectStatus === "In Progress").length;
                        let done = projects.filter((item) => item.projectStatus === "deliver before deadline" ||
                            item.projectStatus === "deliver on time" ||
                            item.projectStatus === "delivered after deadline").length;
                        client.inProgressProject = inProgress;
                        client.doneProject = done;
                        return yield client.save();
                    }
                    return null;
                }
                return null;
            }
            catch (error) {
                logger_1.default.error({ updateClientProcedureError: error });
            }
        });
    }
};
exports.default = ClientDB;
