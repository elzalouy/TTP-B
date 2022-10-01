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
