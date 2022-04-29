"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRoute_1 = __importDefault(require("../routes/user/userRoute"));
const boardRoute_1 = __importDefault(require("../routes/board/boardRoute"));
const techMemberRoute_1 = __importDefault(require("../routes/techMember/techMemberRoute"));
const authRoute_1 = __importDefault(require("../routes/auth/authRoute"));
const depRoute_1 = __importDefault(require("../routes/department/depRoute"));
const projectRoute_1 = __importDefault(require("../routes/project/projectRoute"));
const taskRoute_1 = __importDefault(require("../routes/task/taskRoute"));
const categoryRoute_1 = __importDefault(require("../routes/category/categoryRoute"));
const clientRoute_1 = __importDefault(require("../routes/client/clientRoute"));
const notifiRoute_1 = __importDefault(require("../routes/notification/notifiRoute"));
module.exports = function (app) {
    app.use(function (req, res, next) {
        let allowedOrigins = [
            "http://" + process.env.FRONT_END_URL,
            "https://" + process.env.FRONT_END_URL,
        ];
        let origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
            res.header("Access-Control-Allow-Origin", origin);
        }
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Key, x-auth-token, multipart/form-data");
        res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
        next();
    });
    app.use("/api", authRoute_1.default);
    app.use("/api", taskRoute_1.default);
    app.use("/api", userRoute_1.default);
    app.use("/api", boardRoute_1.default);
    app.use("/api", techMemberRoute_1.default);
    app.use("/api", depRoute_1.default);
    app.use("/api", projectRoute_1.default);
    app.use("/api", categoryRoute_1.default);
    app.use("/api", clientRoute_1.default);
    app.use("/api", notifiRoute_1.default);
};
