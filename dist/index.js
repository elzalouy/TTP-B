"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.http = void 0;
const dotenv_1 = require("dotenv");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbConnect_1 = __importDefault(require("./lib/startup/db/dbConnect"));
const socket_1 = __importDefault(require("./lib/startup/socket"));
const config_1 = __importDefault(require("./lib/startup/i18n/config"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./lib/startup/routes"));
const prod_1 = __importDefault(require("./lib/startup/prod"));
const cron_1 = __importDefault(require("./lib/startup/cron"));
const logger_1 = __importDefault(require("./logger"));
const Config = require("config");
const app = (0, express_1.default)();
(0, prod_1.default)(app);
exports.http = (0, http_1.createServer)(app);
exports.io = (0, socket_1.default)(exports.http);
function server() {
    try {
        //Express App
        app.use(express_1.default.json());
        app.use(express_1.default.static("/src/lib/uploads"));
        app.use((0, cors_1.default)());
        app.use((0, cookie_parser_1.default)());
        app.use((0, morgan_1.default)("dev"));
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use(config_1.default.init);
        (0, dbConnect_1.default)();
        (0, routes_1.default)(app);
        (0, dotenv_1.config)();
        let port = process.env.PORT || 5000;
        exports.http.listen(port, function () {
            console.log("Welcome to", Config.get("name"));
            console.log({
                cards_webhook: Config.get("trelloWebhookUrlTask"),
            });
            console.log("server listen to port " + port);
            (0, cron_1.default)(exports.io);
        });
    }
    catch (error) {
        logger_1.default.error({ message: error });
    }
}
server();
