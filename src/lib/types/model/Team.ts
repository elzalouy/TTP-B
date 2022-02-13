import { Document } from "mongoose";
import { ObjectId } from "bson";

export interface ITech extends Document {
  name: string;
  departmentId: ObjectId;
}

export interface TechMemberData {
  id?: string;
  name: string;
  departmentId: string;
  boardId?: string;
  trelloMemberId?: string;
  listId?: string;
  newBoardId?: string;
}

export interface DataUpdate {
  ids: string[];
  departmentId: string;
}
