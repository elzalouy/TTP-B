import { config } from "dotenv";
import { http } from "./lib/server";

// .env
config(); 

http.listen(process.env.PORT, function () {
  console.log("server listen to port " + process.env.PORT);
});
