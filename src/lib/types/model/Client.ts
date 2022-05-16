import { Document, ObjectId } from "mongoose";

export interface Client extends Document {
  clientName: string;
  image: string | any;
  doneProject: Number;
  inProgressProject: Number;
  inProgressTask: Number;
}

export interface ClientData {
  _id?: string;
  clientName: string;
  image?: string | any;
  doneProject?: Number;
  inProgressProject?: Number;
  inProgressTask?: Number;
}
