import { config } from "dotenv";
import { http } from "./lib/server";
// .env
config();
const port = process.env.PORT || 3000;

http.listen(port, function () {
  console.log("server listen to port " + process.env.PORT);
});
