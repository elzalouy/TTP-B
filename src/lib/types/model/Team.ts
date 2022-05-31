import { Document } from "mongoose";
import { ObjectId } from "bson";

export interface TeamsInterface extends Document {
  name: string;
  departmentId: ObjectId;
  listId: string | null;
}

export interface TeamsData {
  id?: string;
  name?: string;
  departmentId?: string;
  boardId?: string;
  trelloMemberId?: string;
  listId?: string;
  newBoardId?: string;
  mainBaord?: null | boolean;
}

export interface DataUpdate {
  ids: string[];
  departmentId: string;
}
