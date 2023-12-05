import { bool } from "aws-sdk/clients/signer";
import { Binary, ObjectId } from "bson";
import { Document, Model } from "mongoose";

export interface TasksModel extends Model<TaskInfo> {
  updateHistory(cardId: string, cb?: (doc: TaskInfo) => any): TaskInfo;
  getTasksAsCSV(filterIds: string[]): Promise<string>;
}

export interface TaskInfo extends Document {
  name: string;
  projectId: ObjectId;
  categoryId: ObjectId;
  subCategoryId: ObjectId;
  teamId: ObjectId | string;
  listId: string;
  status?: string;
  start?: Date | number;
  deadline?: Date | number;
  cardId?: string;
  boardId?: string;
  description?: string;
  trelloShortUrl?: string;
  attachedFiles?: AttachmentSchema[];
  movements?: Movement[];
  assignedAt?: Date | number;
  teamListId?: string;
  archivedCard?: boolean;
  cardCreatedAt?: Date;
  createdAt?: Date;
  archivedAt?: string;
}

export interface TaskHistory {
  listId: string;
  boardId: string;
  date: string;
}

export interface TasksStatistics {
  id?: ObjectId;
  NoOfTasks: number | null;
  NoOfFinishedTasks: number | null;
  progress: number | null;
}

export interface TaskData {
  _id?: string | ObjectId;
  id?: string;
  name?: string;
  projectId?: string | ObjectId;
  categoryId?: string | ObjectId;
  subCategoryId?: string | ObjectId;
  listId?: string;
  status?: string;
  start?: Date | number;
  deadline?: Date | number;
  teamId?: string | ObjectId;
  cardId?: string;
  boardId?: string;
  trelloShortUrl?: string;
  file?: object;
  description?: string;
  attachedFiles?: AttachmentSchema[];
  deleteFiles?: AttachmentSchema[] | any;
  attachedFile?: AttachmentSchema;
  teamListId?: string;
  movements?: Movement[];
  assignedAt?: Date | number;
  archivedCard?: boolean;
  archivedAt?: string;
  cardCreatedAt?: Date;
  createdAt?: Date;
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

export interface Movement {
  actionId: string;
  status: string;
  movedAt: string;
  journeyDeadline?: string | null;
  listId?: string;
  listType?: "team" | "list" | "sideList";
  listName?: string;
}
export const statusLists = [
  "In Progress",
  "Shared",
  "Done",
  "Tasks Board",
  "Not Clear",
  "Cancled",
  "Review",
  "Archived",
];
