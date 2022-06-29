"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const cluster_adapter_1 = require("@socket.io/cluster-adapter");
const http_1 = require("http");
const socket_1 = __importDefault(require("./socket"));
const cronJobNotifi_1 = __importDefault(require("../services/cronJobNotifi"));
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const Config = require("config");
// Server with sticky sessions.
function default_1(app) {
    let io = null;
    if (cluster_1.default.isPrimary) {
        console.log(`Primary ${process.pid} is running`);
        const http = (0, http_1.createServer)(app);
        setupMaster(http, { loadBalancingMethod: "least-connection" });
        (0, cluster_adapter_1.setupPrimary)();
        http.listen(process.env.PORT, function () {
            console.log("Welcome to", Config.get("name"));
            console.log("web hook url will be,", Config.get("Trello_Webhook_Callback_Url"));
            console.log("server listen to port " + process.env.PORT);
        });
        for (let i = 0; i < os_1.cpus.length; i++) {
            cluster_1.default.fork();
        }
        cluster_1.default.on("exit", (worker) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster_1.default.fork();
        });
        return null;
    }
    else {
        console.log(`Worker ${process.pid} started`);
        const http = (0, http_1.createServer)(app);
        let io = (0, socket_1.default)(http);
        io.adapter((0, cluster_adapter_1.createAdapter)());
        setupWorker(io);
        (0, cronJobNotifi_1.default)(io);
    }
    return io;
}
exports.default = default_1;
