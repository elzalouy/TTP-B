"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketOM = exports.socketClients = void 0;
const config_1 = __importDefault(require("config"));
const socket_io_1 = require("socket.io");
exports.socketClients = [];
exports.socketOM = [];
function appSocket(http) {
    const io = new socket_io_1.Server(http, {
        path: "/socket.io",
        cors: {
            origin: config_1.default.get("FrontEndUrl"),
            methods: "*",
            allowedHeaders: ["Content-type"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        socket.on("disconnect", () => {
            exports.socketClients = exports.socketClients.filter((item) => item.socketId !== socket.id);
            exports.socketOM = exports.socketOM.filter((item) => item.socketId !== socket.id);
            console.log("client disconnected, ", socket.id);
        });
        socket.on("joined-OM", (data) => {
            console.log("joined OM");
            // socketOM = socketOM.filter((item) => item.id !== data._id);
            exports.socketOM.push({
                id: data._id,
                socketId: socket.id,
            });
            console.log("OM connected,", exports.socketOM);
        });
        socket.on("joined-PM", (data) => {
            console.log("joined PM");
            // socketClients = socketClients.filter((item) => item.id !== data._id);
            exports.socketClients.push({
                id: data._id,
                socketId: socket.id,
            });
            console.log("PM connected,", exports.socketClients);
        });
    });
    return io;
}
exports.default = appSocket;
