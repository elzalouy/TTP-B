import { TaskInfo } from "../model/tasks";

/**
 * webhook update response coming from trello api.
 */
export interface webhookUpdateInterface {
  model: {
    id: string;
    name: string;
    closed: boolean;
    idBoard: string;
    pos: number;
  };
  action: {
    id: string;
    idMemberCreator: string;
    data: {
      card: {
        idList?: string;
        id: string;
        name?: string;
        idShort?: number;
        shortLink?: string;
        desc?: string;
      };
      board: {
        id?: string;
        name?: string;
        shortLink?: string;
      };
      old?: { idList?: string };
      attachment?: {
        id: string;
        name: string;
        url: string;
        previewUrl: string;
        previewUrl2x: string;
      };
      listBefore?: { id: string; name: string };
      listAfter?: { id: string; name: string };
      list?: { id: string; name: string };
    };
    appCreator: any;
    type: string; // like 'updateCard'
    date: string;
    limits: any;
    display: {
      translationKey: string; // like "action_move_card_from_list_to_list" "";
      entities: any;
    };
    memberCreator: {
      id: string;
      activityBlocked: boolean;
      avatarHash: string;
      avatarUrl: string;
      fullName: string;
      idMemberReferrer: any;
      initials: string;
      nonPublic: any;
      nonPublicAvailable: boolean;
      username: string;
    };
  };
}
export interface updateCardResponse {
  checkItemStates: any;
  id: string;
  badges: {
    attachmentsByType: {
      trello: {
        board: number;
        card: number;
      };
    };
    location: boolean;
    votes: number;
    viewingMemberVoted: boolean;
    subscribed: boolean;
    fogbugz: string;
    checkItems: string;
    checkItemsChecked: string;
    checkItemsEarliestDue: any;
    comments: number;
    attachments: number;
    description: boolean;
    due: any;
    dueComplete: any;
    start: any;
  };
  closed: boolean;
  dueComplete: boolean;
  dateLastActivity: string;
  desc: string;
  descData: {
    emoji: any;
  };
  due: any;
  dueReminder: any;
  email: any;
  idBoard: String;
  idChecklists: [];
  idList: string;
  idMembers: [];
  idMembersVoted: [];
  idShort: 3;
  idAttachmentCover: any;
  labels: [];
  idLabels: [];
  manualCoverAttachment: false;
  name: string;
  pos: number;
  shortLink: string;
  shortUrl: string;
  start: any;
  subscribed: boolean;
  url: string;
  cover: {
    idAttachment: any;
    color: any;
    idUploadedBackground: any;
    size: string;
    brightness: string;
    idPlugin: any;
  };
  isTemplate: false;
  cardRole: any;
}
/**
 * task response to be returned from any layer to the presentation layer
 */
export interface taskResponse {
  task: TaskInfo | null;
  error: {
    path: string;
    message: string;
  } | null;
}
export let deleteFilesError: taskResponse = {
  error: {
    path: "deleteFiles",
    message: "delete files should have a valid file data.",
  },
  task: null,
};
export let provideCardIdError: taskResponse = {
  error: {
    path: "cardId",
    message:
      "Card id should be provided while uploading files or deleting files.",
  },
  task: null,
};
export let taskNotFoundError: taskResponse = {
  error: {
    path: "task",
    message: "Task not found",
  },
  task: null,
};
