import { AttachmentResponse } from "../model/tasks";

export interface createBoardResponse {
  id: string;
  name: string;
  desc: string;
  descData: any;
  closed: boolean;
  idOrganization: string;
  idEnterprise: any;
  pinned: boolean;
  url: string;
  shortUrl: string;
  prefs: {
    permissionLevel: string;
    hideVotes: boolean;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    isTemplate: boolean;
    cardAging: string;
    calendarFeedEnabled: boolean;
    hiddenPluginBoardButtons: any[];
    switcherViews: any;
    background: string;
    backgroundColor: string;
    backgroundImage: string | null;
    backgroundImageScaled: string | null;
    backgroundTile: boolean;
    backgroundBrightness: string;
    backgroundBottomColor: string;
    backgroundTopColor: string;
    canBePublic: boolean;
    canBeEnterprise: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
  };
  labelNames: any;
  limits: any;
}
export interface createListResponse {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  limits: any;
}
export interface createCardInBoardResponse {
  model: {
    id: string;
    name: string;
    desc: string;
    descData: any;
    closed: boolean;
    idOrganization: string;
    idEnterprise: any;
    pinned: boolean;
    url: string;
    shortUrl: string;
    prefs: Object;
    labelNames: Object;
  };
  action: {
    id: string;
    idMemberCreator: string;
    data: {
      card: {
        id: string;
        name: string;
        idShort: number;
        shortLink: string;
        due?: string;
        start?: string;
      };
      list: { id: string; name: string };
      board: {
        id: string;
        name: string;
        shortLink: string;
      };
    };
    appCreator: string;
    type: string;
    date: string;
    limits: any;
    display: {
      translationKey: string;
      entities: {
        card: Object;
        list: Object;
        memberCreator: Object;
      };
    };
    memberCreator: Object;
  };
}

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
        closed?: boolean;
        start?: string;
        due?: string;
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
      boardSource?: {
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
      listSource?: { id: string };
      list?: { id: string; name: string };
      listAfter?: { id: string; name: string };
      listBefore?: { id: string; name: string };
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
export type editCardParams = {
  cardId: string;
  data: {
    name: string;
    desc?: string;
    idBoard?: string;
    idList?: string;
    start?: string;
    due?: string;
    closed?: boolean;
  };
};
export type Board = {
  id: string;
  name: string;
  lists?: List[];
  closed?: boolean;
};
export type List = {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  softLimit: any;
};
export type Card = {
  id: string;
  desc: string;
  due: any;
  idBoard: string;
  idList: string;
  name: string;
  shortLink: string;
  shortUrl: string;
  start: any;
  url: string;
  badges: [Object];
  checkItemStates: null;
  closed: boolean;
  dueComplete: boolean;
  dateLastActivity: string;
  descData: [Object];
  dueReminder: any;
  email: any;
  idChecklists: [];
  idMembers: any[];
  idMembersVoted: any[];
  idShort: number;
  idAttachmentCover: string;
  labels: any[];
  idLabels: any[];
  manualCoverAttachment: boolean;
  pos: number;
  subscribed: boolean;
  cover: [Object];
  isTemplate: boolean;
  cardRole: boolean;
  attachments?: AttachmentResponse[];
};

export type TrelloAction = {
  id: string;
  idMemberCreator: string;
  data: {
    card: {
      closed?: boolean;
      start?: string;
      due?: string;
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
    listSource?: { id: string };
    list?: { id: string; name: string };
    listAfter?: { id: string; name: string };
    listBefore?: { id: string; name: string };
  };
  appCreator: {
    id: string;
  };
  type: string; // like 'updateCard'
  date: string;
  limits: any;
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
