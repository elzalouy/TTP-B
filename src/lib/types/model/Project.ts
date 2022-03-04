import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface ProjectInfo extends Document {
  name: string;
  projectManager: ObjectId;
  teamsId?: string[];
  numberOfTasks?: number;
  numberOfFinshedTasks?: number;
  projectDeadline: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "inProgress"
    | "deliver on time"
    | "late"
    | "deliver defore deadline"
    | "delivered after deadline";
  clientId: ObjectId;
}

export interface ProjectData {
  id?: string;
  name: string;
  projectManager: string;
  teamsId?: string[];
  numberOfTasks?: number;
  numberOfFinshedTasks?: number;
  projectDeadline: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "inProgress"
    | "deliver on time"
    | "late"
    | "deliver defore deadline"
    | "delivered after deadline";
  clientId: string;
}
