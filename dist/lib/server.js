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
//DB
//Routes
const userRoute_1 = __importDefault(require("./routes/user/userRoute"));
const boardRoute_1 = __importDefault(require("./routes/board/boardRoute"));
const techMemberRoute_1 = __importDefault(require("./routes/techMember/techMemberRoute"));
const authRoute_1 = __importDefault(require("./routes/auth/authRoute"));
const depRoute_1 = __importDefault(require("./routes/department/depRoute"));
const projectRoute_1 = __importDefault(require("./routes/project/projectRoute"));
const taskRoute_1 = __importDefault(require("./routes/task/taskRoute"));
const categoryRoute_1 = __importDefault(require("./routes/category/categoryRoute"));
const clientRoute_1 = __importDefault(require("./routes/client/clientRoute"));
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
// app.get('/api/creatUser',(req,res) => {
//   // let definedUrl = trelloApi('webhooks')
//   // i18n.setLocale('en')
// // "idBoard": "616577753fa7db4ef1e715ea",
//   // logger.info(trelloApi('card'))
//   res.send(i18n.__('key'))
// })
// Ngrok init
if (process.env.NODE_ENV === "development") {
    ngrok.connect({
        proto: "http",
        addr: process.env.PORT,
    }, (err) => {
        if (err) {
            console.error("Error while connecting Ngrok", err);
            return new Error("Ngrok Failed");
        }
    });
}
// auth route
app.use("/api", authRoute_1.default);
// task route
app.use("/api", taskRoute_1.default);
// Authenticate User
// app.use(async (req:Request,res:Response,next:NextFunction) => {
//   let checkToken:string | JwtPayload = await jwtVerify(req.cookies.token)
//   if(checkToken.user){
//     const{user}=checkToken
//     let findUser = await UserDB.findUserById(user.id)
//     if(findUser){
//       next()
//     } else {
//       return res.status(401).send(customeError('user_not_exsit',401))
//     }
//   }else {
//     return res.status(401).send(customeError('user_not_exsit',401))
//   }
// })
//routes
app.use("/api", userRoute_1.default);
app.use("/api", boardRoute_1.default);
app.use("/api", techMemberRoute_1.default);
app.use("/api", depRoute_1.default);
app.use("/api", projectRoute_1.default);
app.use("/api", categoryRoute_1.default);
app.use("/api", clientRoute_1.default);
app.disable("etag");
// connect to socket io
exports.io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
});
