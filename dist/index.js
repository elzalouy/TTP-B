"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_1 = require("./lib/server");
const Config = require("config");
// .env
(0, dotenv_1.config)();
const port = process.env.PORT || 5000;
server_1.http.listen(port, function () {
    console.log("Welcome to", Config.get("name"));
    console.log("web hook url will be,", Config.get("Trello_Webhook_Callback_Url"));
    console.log("server listen to port " + port);
});
