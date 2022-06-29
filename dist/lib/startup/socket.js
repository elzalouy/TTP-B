"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const lodash_1 = __importDefault(require("lodash"));
const socket_io_1 = require("socket.io");
function appSocket(http) {
    let clients = [];
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
        clients.push(socket.id);
        clients = lodash_1.default.uniq(clients);
        console.log("client connected, ", socket.id);
        console.log("no of clients,", clients.length);
        socket.on("disconnect", () => {
            clients = clients.filter((item) => item !== socket.id);
            console.log("client disconnected, ", socket.id);
            console.log("no of clients,", clients.length);
        });
        socket.on("joined-admin", () => {
            console.log("joined-admin");
            return socket.join("admin-room");
        });
        socket.on("joined-manager", () => {
            console.log("joined-manager");
            return socket.join("manager-room");
        });
        socket.on("joined-user", (data) => {
            if (data.id) {
                console.log(`user-${data.id}`);
                return socket.join(`user-${data.id}`);
            }
        });
    });
    return io;
}
exports.default = appSocket;
