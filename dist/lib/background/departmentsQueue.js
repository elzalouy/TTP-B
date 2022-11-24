"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentQueue = void 0;
const queue_1 = __importDefault(require("queue"));
exports.DepartmentQueue = (0, queue_1.default)({ results: [] });
/**
 * CreateOne
 *
 * It's a function for pushing a task to the Department Queue for being processed.
 * it takes a turn on the processing queue of this worker.
 * Once the process is done it will return a callback with two paramters error and returned data.
 * If an error just hapenned, it will emit an event to the client using the websocket connection and cancel the create request.
 * @param department DepartmentData
 */
// export const createOneJob = (
//   department: DepartmentInfo,
//   teams: { name: string; _id: any }[]
// ) => {
//   DepartmentQueue.push(async (cb) => {
//     try {
//       if (department._id) {
//         let defaultListId: string = "";
//         let sharedListID: string = "";
//         let doneListId: string = "";
//         let reviewListId: string = "";
//         let notClearListId: string = "";
//         let canceldListId: string = "";
//         let In ProgressListId: string = "";
//         let In Progress: createListResponse =
//           await TrelloController.addListToBoard(
//             department.boardId,
//             "In Progress"
//           );
//         In ProgressListId = In Progress.id;
//         let cancel: createListResponse = await TrelloController.addListToBoard(
//           department.boardId,
//           "Cancled"
//         );
//         canceldListId = cancel.id;
//         let NotClear: createListResponse = await TrelloController.addListToBoard(
//           department.boardId,
//           "Not Clear"
//         );
//         notClearListId = NotClear.id;
//         let done: createListResponse = await TrelloController.addListToBoard(
//           department.boardId,
//           "Done"
//         );
//         doneListId = done.id;
//         let shared: createListResponse = await TrelloController.addListToBoard(
//           department.boardId,
//           "Shared"
//         );
//         sharedListID = shared.id;
//         let review: createListResponse = await TrelloController.addListToBoard(
//           department.boardId,
//           "Review"
//         );
//         reviewListId = review.id;
//         let defaultList: createListResponse =
//           await TrelloController.addListToBoard(
//             department.boardId,
//             "Tasks Board"
//           );
//         defaultListId = defaultList.id;
//         // // create list and webhook for the team
//         let teamListIds: { idInTrello: string; idInDB: any; name: string }[] =
//           await DepartmentController.__createTeamAndList(
//             teams,
//             department.boardId
//           );
//         defaultListId = defaultList.id;
//         // create webhook for list
//         // const listId: string[] = [
//         //   defaultListId,
//         //   sharedListID,
//         //   doneListId,
//         //   reviewListId,
//         //   notClearListId,
//         //   canceldListId,
//         //   In ProgressListId,
//         // ];
//         // let webhookCreate = listId.map(async (id) => {
//         //   return await TrelloController.createWebHook(id);
//         // });
//         // Promise.all(webhookCreate).then((res) =>
//         //   logger.info({ webhookCreateResult: "webhook done" })
//         // );
//         let data = {
//           defaultListId,
//           sharedListID,
//           doneListId,
//           reviewListId,
//           notClearListId,
//           canceldListId,
//           In ProgressListId,
//           teamsId: teamListIds,
//         };
//         let result = await DepartmentController.__createTeamList(
//           teams,
//           department._id,
//           data
//         );
//         if (!department || !result) {
//           io?.sockets?.emit("new-department-error", { id: department._id });
//           await TrelloController.deleteBoard(department.boardId);
//           await DepartmentController.deleteDepartment(department._id);
//           await cb(new Error("Board was not created"), null);
//         }
//         io?.sockets?.emit("new-department", result);
//         cb(null, result);
//       }
//     } catch (error) {
//       // socket event should emit here
//       logger.error({ createDepartmentJobError: error });
//     }
//   });
// };
