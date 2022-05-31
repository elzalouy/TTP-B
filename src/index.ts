import { config } from "dotenv";
import { http } from "./lib/server";
const Config = require("config");
// .env
config();
const port = process.env.PORT || 5000;
http.listen(port, function () {
  console.log("Welcome to", Config.get("name"));
  console.log(
    "web hook url will be,",
    Config.get("Trello_Webhook_Callback_Url")
  );
  console.log("server listen to port " + port);
});
