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
// create task webhookcall request
// {
//   model: {
//     id: '62aec370771335205def3867',
//     name: 'Tasks Board',
//     closed: false,
//     idBoard: '62aec36cb48be91b8225db36',
//     pos: 256
//   },
//   action: {
//     display: { translationKey: 'action_create_card', entities: [Object] },
//     id: '62aed0f1bedc786418da1235',
//     idMemberCreator: '625c6c7c6fc2b45763b718dc',
//     data: { card: [Object], list: [Object], board: [Object] },
//     appCreator: { id: '625dce5c804a8202138a2cbb' },
//     type: 'createCard',
//     date: '2022-06-19T07:32:01.427Z',
//     limits: null,
//     memberCreator: {
//       id: '625c6c7c6fc2b45763b718dc',
//       activityBlocked: false,
//       avatarHash: 'e0c1259acd53c6ab783eb53ffe55176c',
//       avatarUrl: 'https://trello-members.s3.amazonaws.com/625c6c7c6fc2b45763b718dc/e0c1259acd53c6ab783eb53ffe55176c',
//       fullName: 'UNICODE.TTP',
//       idMemberReferrer: null,
//       initials: 'U',
//       nonPublic: {},
//       nonPublicAvailable: true,
//       username: 'unicodettp'
//     }
//   }
// }
// move task webhook request
// {
//   model: {
//     id: '62aec36fdc63a032a1db5a31',
//     name: 'Review',
//     closed: false,
//     idBoard: '62aec36cb48be91b8225db36',
//     pos: 512
//   },
//   action: {
//     id: '62aed18f7f957c663ac175c6',
//     idMemberCreator: '625c6c7c6fc2b45763b718dc',
//     data: {
//       card: [Object],
//       old: [Object],
//       board: [Object],
//       listBefore: [Object],
//       listAfter: [Object]
//     },
//     appCreator: null,
//     type: 'updateCard',
//     date: '2022-06-19T07:34:39.330Z',
//     limits: null,
//     display: {
//       translationKey: 'action_move_card_from_list_to_list',
//       entities: [Object]
//     },
//     memberCreator: {
//       id: '625c6c7c6fc2b45763b718dc',
//       activityBlocked: false,
//       avatarHash: 'e0c1259acd53c6ab783eb53ffe55176c',
//       avatarUrl: 'https://trello-members.s3.amazonaws.com/625c6c7c6fc2b45763b718dc/e0c1259acd53c6ab783eb53ffe55176c',
//       fullName: 'UNICODE.TTP',
//       idMemberReferrer: null,
//       initials: 'U',
//       nonPublic: {},
//       nonPublicAvailable: true,
//       username: 'unicodettp'
//     }
//   }
// }
// change desc webhook request
// {
//   model: {
//     id: '62aec36fdc63a032a1db5a31',
//     name: 'Review',
//     closed: false,
//     idBoard: '62aec36cb48be91b8225db36',
//     pos: 512
//   },
//   action: {
//     id: '62aed1d545f898805c687238',
//     idMemberCreator: '625c6c7c6fc2b45763b718dc',
//     data: { card: [Object], old: [Object], board: [Object], list: [Object] },
//     appCreator: null,
//     type: 'updateCard',
//     date: '2022-06-19T07:35:49.821Z',
//     limits: null,
//     display: {
//       translationKey: 'action_changed_description_of_card',
//       entities: [Object]
//     },
//     memberCreator: {
//       id: '625c6c7c6fc2b45763b718dc',
//       activityBlocked: false,
//       avatarHash: 'e0c1259acd53c6ab783eb53ffe55176c',
//       avatarUrl: 'https://trello-members.s3.amazonaws.com/625c6c7c6fc2b45763b718dc/e0c1259acd53c6ab783eb53ffe55176c',
//       fullName: 'UNICODE.TTP',
//       idMemberReferrer: null,
//       initials: 'U',
//       nonPublic: {},
//       nonPublicAvailable: true,
//       username: 'unicodettp'
//     }
//   }
// }
// change name webhook request
// {
//   model: {
//     id: '62aec36fdc63a032a1db5a31',
//     name: 'Review',
//     closed: false,
//     idBoard: '62aec36cb48be91b8225db36',
//     pos: 512
//   },
//   action: {
//     id: '62aed205c4318869128aa523',
//     idMemberCreator: '625c6c7c6fc2b45763b718dc',
//     data: { card: [Object], old: [Object], board: [Object], list: [Object] },
//     appCreator: null,
//     type: 'updateCard',
//     date: '2022-06-19T07:36:37.716Z',
//     limits: null,
//     display: { translationKey: 'action_renamed_card', entities: [Object] },
//     memberCreator: {
//       id: '625c6c7c6fc2b45763b718dc',
//       activityBlocked: false,
//       avatarHash: 'e0c1259acd53c6ab783eb53ffe55176c',
//       avatarUrl: 'https://trello-members.s3.amazonaws.com/625c6c7c6fc2b45763b718dc/e0c1259acd53c6ab783eb53ffe55176c',
//       fullName: 'UNICODE.TTP',
//       idMemberReferrer: null,
//       initials: 'U',
//       nonPublic: {},
//       nonPublicAvailable: true,
//       username: 'unicodettp'
//     }
//   }
// }
// add atachment to card
// {
//   model: {
//     id: '62aec36fdc63a032a1db5a31',
//     name: 'Review',
//     closed: false,
//     idBoard: '62aec36cb48be91b8225db36',
//     pos: 512
//   },
//   action: {
//     id: '62aed245d978b32b80827922',
//     idMemberCreator: '625c6c7c6fc2b45763b718dc',
//     data: {
//       attachment: [Object],
//       card: [Object],
//       list: [Object],
//       board: [Object]
//     },
//     appCreator: null,
//     type: 'addAttachmentToCard',
//     date: '2022-06-19T07:37:41.841Z',
//     limits: null,
//     display: {
//       translationKey: 'action_add_attachment_to_card',
//       entities: [Object]
//     },
//     memberCreator: {
//       id: '625c6c7c6fc2b45763b718dc',
//       activityBlocked: false,
//       avatarHash: 'e0c1259acd53c6ab783eb53ffe55176c',
//       avatarUrl: 'https://trello-members.s3.amazonaws.com/625c6c7c6fc2b45763b718dc/e0c1259acd53c6ab783eb53ffe55176c',
//       fullName: 'UNICODE.TTP',
//       idMemberReferrer: null,
//       initials: 'U',
//       nonPublic: {},
//       nonPublicAvailable: true,
//       username: 'unicodettp'
//     }
//   }
// }
// delete attachment from card not calling the webhook
// delete card web hook request
// {
//   model: {
//     id: '62aec36fdc63a032a1db5a31',
//     name: 'Review',
//     closed: false,
//     idBoard: '62aec36cb48be91b8225db36',
//     pos: 512
//   },
//   action: {
//     id: '62aed27d5f7d18107f514663',
//     idMemberCreator: '625c6c7c6fc2b45763b718dc',
//     data: { card: [Object], list: [Object], board: [Object] },
//     appCreator: null,
//     type: 'deleteCard',
//     date: '2022-06-19T07:38:37.939Z',
//     limits: null,
//     display: { translationKey: 'action_delete_card', entities: [Object] },
//     memberCreator: {
//       id: '625c6c7c6fc2b45763b718dc',
//       activityBlocked: false,
//       avatarHash: 'e0c1259acd53c6ab783eb53ffe55176c',
//       avatarUrl: 'https://trello-members.s3.amazonaws.com/625c6c7c6fc2b45763b718dc/e0c1259acd53c6ab783eb53ffe55176c',
//       fullName: 'UNICODE.TTP',
//       idMemberReferrer: null,
//       initials: 'U',
//       nonPublic: {},
//       nonPublicAvailable: true,
//       username: 'unicodettp'
//     }
//   }
// }

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
