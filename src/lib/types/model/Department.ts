import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface DepartmentInfo extends Document {
  name: string;
  boardId: string;
  defaultListId: string;
  reviewListId: string;
  sharedListID: string;
  doneListId: string;
  notClearListId: string;
  canceldListId: string;
  departmentWindowId: string;
  notStartedListId: string;
  color: string;
  mainBoard: boolean;
  teamsId: {
    idInTrello: string;
    idInDB: any;
  }[];
  tasks: string[];
}

export interface DepartmentData {
  id?: string;
  name?: string;
  color?: string;
  boardId?: string;
  defaultListId?: string;
  reviewListId?: string;
  sharedListID?: string;
  doneListId?: string;
  notClearListId?: string;
  canceldListId?: string;
  departmentWindowId?: string;
  notStartedListId?: string;
  teamsId?: { idInTrello: string; idInDB: any }[];
  teams?: { name: string; _id: any }[];
  mainBoard?: boolean | null;
  tasks?: string[];
}

export interface UpdateDepartment {
  _id?: string;
  name?: string;
  boardId?: string;
  color?: string;
  mainBoard?: boolean | null;
  teams?: string[];
  removeTeam?: string[] | null;
  addTeam?:
    | {
        _id: string;
        name: string;
      }[]
    | null;
  listIds?: string[] | null;
}
