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
const socket_1 = __importDefault(require("./startup/socket"));
const config_1 = __importDefault(require("./i18n/config"));
const config_2 = __importDefault(require("config"));
const ngrok = require("ngrok");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(config_1.default.init);
(0, dbConnect_1.default)();
exports.http = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(exports.http, {
    cors: {
        origin: config_2.default.get("FrontEndUrl"),
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ["websocket"]
});
(0, socket_1.default)(exports.io);
require("./startup/routes")(app);
app.disable("etag");
require("./services/cronJobNotifi/cronJobNotifi");
