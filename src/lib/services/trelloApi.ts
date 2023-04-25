import multer from "multer";
import config from "config";
export const trelloApi = (route: string): string => {
  let url = `https://api.trello.com/1/${route}key=${config.get(
    "trelloKey"
  )}&token=${config.get("trelloToken")}`;
  return url;
};
export const trelloApiWithUrl = (route: string, params: string): string => {
  let url = `https://api.trello.com/1/${route}/?key=${config.get(
    "trelloKey"
  )}&token=${config.get("trelloToken")}&${params}`;
  return url;
};
