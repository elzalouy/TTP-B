import { Document } from "mongoose";
import { ObjectId } from "bson";

export interface TeamsInterface extends Document {
  name: string;
  departmentId: ObjectId;
  isDeleted:boolean;
  listId: string | null;
}

export interface TeamsData {
  id?: string;
  name?: string;
  departmentId?: string;
  boardId?: string;
  trelloMemberId?: string;
  isDeleted?:boolean;
  listId?: string;
  newBoardId?: string;
  mainBaord?: null | boolean;
}

export interface DataUpdate {
  ids: string[];
  departmentId: string;
}
