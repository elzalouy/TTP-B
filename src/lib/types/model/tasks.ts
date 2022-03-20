import { Binary, ObjectId } from "bson";
import { Document } from "mongoose";

export interface TaskInfo extends Document {
  name: string;
  projectId: ObjectId;
  categoryId: ObjectId;
  subCategoryId: ObjectId;
  memberId: ObjectId;
  countNotClear?: number;
  countShared?: number;
  status?: "inProgress" | "delivered on time" | "late" | "no clear" | "cancled";
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

export interface TaskData {
  id?: string;
  name: string;
  projectId: string;
  categoryId: string; //todo creat category list
  subCategoryId: string;
  countNotClear?: number;
  countShared?: number;
  status?: "inProgress" | "delivered on time" | "late" | "no clear" | "cancled";
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnoverTime?: number;
  attachedFiles?: string;
  attachedCard?: string;
  memberId: string;
  listId?: string;
  cardId?: string;
  boardId?: string;
  file?: object;
  description: string;
}
