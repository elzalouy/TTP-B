import { Document } from "mongoose";
import { CheckList, Label } from "../controller/trello";
import { Model } from "mongoose";

export interface TaskPlugin extends Document {
  taskId: string;
  cardId: string;
  name: string;
  checkLists: CheckList[];
  labels: Label[];
  comments: { comment: string }[];
}
export interface TasksPluginsModel extends Model<TaskPlugin> {}
