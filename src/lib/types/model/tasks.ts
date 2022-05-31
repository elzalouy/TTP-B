import { Binary, ObjectId } from "bson";
import { Document } from "mongoose";
// export interface TrelloData
export interface TaskInfo extends Document {
  name: string;
  projectId: ObjectId;
  categoryId: ObjectId;
  subCategoryId: ObjectId;
  teamId: ObjectId;
  listId: string;
  countNotClear?: number;
  countShared?: number;
  status?:
    | "inProgress"
    | "done"
    | "shared"
    | "not started"
    | "not clear"
    | "cancled"
    | "review";
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnoverTime?: number;
  attachedFiles?: string;
  attachedCard?: string;
  cardId?: string;
  boardId?: string;
  description: String;
}
export interface TasksStatistics {
  id?: ObjectId;
  numberOfTasks: number | null;
  numberOfFinishedTasks: number | null;
  progress: number | null;
}
export interface TaskData {
  _id?: string;
  name?: string;
  projectId?: string;
  categoryId?: string; //todo creat category list
  subCategoryId?: string;
  countNotClear?: number;
  countShared?: number;
  listId?: string;
  status?:
    | "inProgress"
    | "done"
    | "shared"
    | "not clear"
    | "not started"
    | "cancled"
    | "review";
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnoverTime?: number;
  attachedFiles?: string | any;
  attachedCard?: string;
  teamId?: string;
  cardId?: string;
  boardId?: string;
  file?: object;
  description?: string;
}
