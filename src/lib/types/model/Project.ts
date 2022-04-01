import { ObjectId } from "bson";
import { Document } from "mongoose";
export interface ProjectInfo extends Document {
  name: string;
  projectManager: ObjectId;
  membersId?: string[];
  numberOfTasks?: number;
  numberOfFinshedTasks?: number;
  projectDeadline: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "inProgress"
    | "deliver on time"
    | "late"
    | "deliver before deadline"
    | "delivered after deadline";
  clientId: ObjectId;
  description: String;
}
export interface ProjectData {
  _id?: string;
  name?: string;
  projectManager?: string;
  membersId?: string[];
  numberOfTasks?: number;
  numberOfFinshedTasks?: number;
  projectDeadline?: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "inProgress"
    | "deliver on time"
    | "late"
    | "deliver defore deadline"
    | "delivered after deadline";
  clientId?: string;
  description?: string;
}
