"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.http = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dbConnect_1 = __importDefault(require("./db/dbConnect"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./i18n/config"));
const ngrok = require("ngrok");
const app = (0, express_1.default)();
exports.http = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(exports.http, {
    cors: {
        origin: "*",
        credentials: true,
    },
});
app.use((0, cookie_parser_1.default)());
// middlewares
app.use((0, morgan_1.default)("dev"));
// for parsing application/json
app.use(express_1.default.json());
// for parsing application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
// MongoDB init
(0, dbConnect_1.default)();
// i18n init
app.use(config_1.default.init);
// if (process.env.NODE_ENV === "development") {
//   ngrok.connect(
//     {
//       proto: "http",
//       addr: process.env.PORT,
//     },
//     (err: any) => {
//       if (err) {
//         console.error("Error while connecting Ngrok", err);
//         return new Error("Ngrok Failed");
//       }
//     }
//   );
// }
require("./startup/routes")(app);
app.disable("etag");
// start my notification cron job
require("./services/cronJobNotifi/cronJobNotifi");
exports.io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
    //* this for admins role only
    socket.on("joined admin", () => {
        // logger.info({ data });
        return socket.join("admin room");
    });
    //* this for project managers role only
    socket.on("joined manager", () => {
        // logger.info({ data });
        return socket.join("manager room");
    });
    //* this is for specific user
    socket.on('joined user', (data) => {
        return socket.join(`user-${data.id}`);
    });
});
