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
  color:string;
  // teamListIds:string[];
  // teamsIdInDB:ObjectId[];
  teamsId:{
    idInTrello:string;
    idInDB:any;
  }[]
}

export interface DepartmentData {
  id?: string;
  name?: string;
  color?:string;
  boardId?: string;
  defaultListId?: string;
  reviewListId?: string;
  sharedListID?: string;
  doneListId?: string;
  notClearListId?: string;
  canceldListId?: string;
  teamsId?:{idInTrello:string; idInDB:any}[];
  teams?:{name:string; _id:any}[];
  mainBoard?:boolean|null;
}

export interface UpdateDepartment {
  _id?: string;
  name?: string,
  boardId?: string,
  color?: string,
  mainBoard?:boolean|null;
  teams?:string[];
  removeTeam?:string[] | null;
  addTeam?:{
    _id:string;
    name:string;
  }[]|null
}
