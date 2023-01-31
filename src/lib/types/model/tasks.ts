import { bool } from "aws-sdk/clients/signer";
import { Binary, ObjectId } from "bson";
import { Document, Model } from "mongoose";

export interface TasksModel extends Model<TaskInfo> {
  updateHistory(cardId: string, cb?: (doc: TaskInfo) => any): TaskInfo;
  getTasksAsCSV(filterIds: string[]): Promise<string>;
}

export interface TaskDeadlineChain {
  name: string;
  userId: string;
  before: Date;
  current: Date;
}
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
  cardId?: string;
  boardId?: string;
  description?: string;
  lastMove?: string | String;
  lastMoveDate?: string | String;
  trelloShortUrl?: string;
  deadlineChain: TaskDeadlineChain[];
  turnOver?: number;
  unClear?: number;
  noOfRevisions?: number;
}

export interface TaskHistory {
  listId: string;
  boardId: string;
  date: string;
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
  projectId?: string | ObjectId;
  categoryId?: string | ObjectId;
  subCategoryId?: string | ObjectId;
  categoryName?: string;
  subCategoryName?: string;
  countNotClear?: number;
  countShared?: number;
  listId?: string;
  status?: string;
  start?: Date | number;
  deadline?: Date | number;
  deliveryDate?: Date;
  done?: Date;
  turnover?: Number;
  teamId?: string | ObjectId;
  cardId?: string;
  boardId?: string;
  trelloShortUrl?: string;
  file?: object;
  description?: string;
  lastMove?: string | String;
  lastMoveDate?: string | String;
  // edit task files only
  attachedFiles?: AttachmentSchema[];
  deleteFiles?: AttachmentSchema[] | any;
  attachedFile?: AttachmentSchema;
  teamListId?: string;
  deadlineChain?: TaskDeadlineChain[];
  turnOver?: number;
  unClear?: number;
  noOfRevisions?: number;
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
