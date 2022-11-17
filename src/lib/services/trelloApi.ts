import multer from "multer";
import config from "config";
export const trelloApi = (service: string): string => {
  let url = `https://api.trello.com/1/${service}key=${config.get(
    "trelloKey"
  )}&token=${config.get("trelloToken")}`;
  return url;
};
