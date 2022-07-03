import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface NotificationInfo extends Document {
  title: string;
  description: string;
  isNotified: IsNotified[];
}

export interface NotificationData {
  _id?: string;
  title?: string;
  description?: string;
  isNotified?: IsNotified[];
}
export type IsNotified = {
  userId: string | ObjectId;
  isNotified: boolean;
};
