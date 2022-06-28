import { bool } from "aws-sdk/clients/signer";
import { Binary, ObjectId } from "bson";
import { Document } from "mongoose";
// export interface TrelloData
export interface TaskInfo extends Document {
  name: string;
  projectId: ObjectId;
  categoryId: ObjectId;
  subCategoryId: ObjectId;
  teamId: ObjectId;
  listId: string;
  status?: string;
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  attachedFiles?: AttachmentSchema[];
  attachedCard?: string;
  cardId?: string;
  boardId?: string;
  description?: string;
  lastMove?: string | String;
  lastMoveDate?: string | String;
}
export interface TasksStatistics {
  id?: ObjectId;
  numberOfTasks: number | null;
  numberOfFinishedTasks: number | null;
  progress: number | null;
}
export interface TaskData {
  _id?: string;
  id?: string;
  name?: string;
  projectId?: string;
  categoryId?: string;
  subCategoryId?: string;
  countNotClear?: number;
  countShared?: number;
  listId?: string;
  status?: string;
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnoverTime?: number;
  attachedFiles?: AttachmentSchema[];
  attachedCard?: string;
  teamId?: string;
  cardId?: string;
  boardId?: string;
  file?: object;
  description?: string;
  lastMove?: string;
  lastMoveDate?: String;
  // edit task files only
  deleteFiles?: AttachmentSchema[] | any;
}
export interface AttachmentResponse {
  id: string;
  bytes: number;
  date: Date;
  edgeColor: string;
  idMember: string;
  isUpload: true;
  mimeType: string;
  name: string;
  previews: {
    id: string;
    _id: string;
    scaled: bool;
    url: string;
    bytes: number;
    height: number;
    width: number;
  }[];
  url: string;
  pos: number;
  fileName: string;
  limits: any;
}
export interface AttachmentSchema {
  _id?: string | ObjectId;
  name?: string;
  trelloId: string;
  mimeType: string;
  url: string;
}
export interface DownloadAttachmentResponse {}
