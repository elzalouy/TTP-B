import { Document, ObjectId } from "mongoose";

export interface Client extends Document {
  clientName: string;
  image: string | any;
  doneProject: ObjectId[];
  inProgressProject: ObjectId[];
  inProgressTask: ObjectId[];
}

export interface ClientData {
  id?: string;
  clientName: string;
  image?: string | any;
  doneProject?: ObjectId[];
  inProgressProject?: ObjectId[];
  inProgressTask?: ObjectId[];
}
