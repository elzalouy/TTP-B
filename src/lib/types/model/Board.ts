import { Document  } from "mongoose";

export interface Board extends Document {
    name: string;
    boardId: string;
  }

  export interface BoardData{
    name: string;
    id?:string
  }