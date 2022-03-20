"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apis_1 = __importDefault(require("./apis"));
const express_1 = require("express");
const client_1 = __importDefault(require("../../presentation/client/client"));
const router = (0, express_1.Router)();
const { GET_CLIENT, GET_ALL_CLIENTS, CREATE_CLIENT, DELETE_CLIENT, UPDATE_CLIENT, } = apis_1.default;
const { handleCreateClient, handleDeleteClient, handleUpdateClient, handleGetAllClients, } = client_1.default;
router.post(`${CREATE_CLIENT}`, handleCreateClient);
router.put(`${UPDATE_CLIENT}`, handleUpdateClient);
router.delete(`${DELETE_CLIENT}`, handleDeleteClient);
router.get(`${GET_ALL_CLIENTS}`, handleGetAllClients);
exports.default = router;
