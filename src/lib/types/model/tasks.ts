import { Binary, ObjectId } from "bson";
import { Document } from "mongoose";

export interface TaskInfo extends Document {
  name: string;
  projectId: ObjectId;
  categoryId: ObjectId;
  teamId: ObjectId;
  countNotClear?: number;
  countShared?: number;
  status?: "inProgress" | "deliver on time" | "late" | "no clear" | "cancled";
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnoverTime?: number;
  attachedFiles?: string;
  attachedCard?: string;
  cardId?:string;
  boardId?:string;
}

export interface TaskData {
  id?: string;
  name: string;
  projectId: string;
  categoryId: string; //todo creat category list
  teamId: string;
  countNotClear?: number;
  countShared?: number;
  status?: "inProgress" | "deliver on time" | "late" | "no clear" | "cancled";
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnoverTime?: number;
  attachedFiles?: string;
  attachedCard?: string;
  listId?:string;
  cardId?:string;
  boardId?:string;
  file?:object
}
