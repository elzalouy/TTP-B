import { Document, Model } from "mongoose";

export interface ITrelloActionsOfSnapshot {
  id: string;
  idMemberCreator: string;
  data: {
    text?: string;
    card: {
      id: string;
      name?: string;
      idShort?: number;
      desc?: string;
      due?: string;
      start?: string;
    };
    board: {
      id: string;
      name: string;
      shortLink: string;
    };
    list: { id: string; name: string };
  };
  appCreator: {
    id: string;
  };
  type: string;
  date: string;
  limits: {
    reactions: {
      perAction: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      uniquePerAction: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  } | null;
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
}

export interface ITrelloSnapshot extends Document {
  actions: ITrelloActionsOfSnapshot[];
  createdAt: Date;
}
