export interface webhookUpdateInterface {
  model: {
    id: string;
    name: string;
    closed: boolean;
    idBoard: boolean;
    pos: number;
  };
  action: {
    id: string;
    idMemberCreator: string;
    data: {
      card: {
        idList: string;
        id: string;
        name: string;
        idShort: number;
        shortLink: string;
      };
      old: { idList: string };
      board: {
        id: string;
        name: string;
        shortLink: string;
      };
      listBefore: any;
      listAfter: any;
    };
    appCreator: any;
    type: string; // like 'updateCard'
    date: string;
    limits: any;
    display: {
      translationKey: string; // like "action_move_card_from_list_to_list";
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
