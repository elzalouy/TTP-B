import queue from "queue";
import DepartmentController from "../../controllers/department";
import TrelloActionsController from "../../controllers/trello";
import Project from "../../models/Project";
import { IDepartment } from "../../types/model/Department";
import { ProjectInfo } from "../../types/model/Project";

export const departmentsQueue = queue({ results: [], autostart: true });

export const createProjectsCardsInCreativeBoard = (board: IDepartment) => {
  let lists = board.lists;
  departmentsQueue.push(async (cb) => {
    let isProjectsList = lists.find((item) => item.name === "projects");
    if (isProjectsList) {
      let projects = await Project.find({});
      projects.forEach(async (item: ProjectInfo) => {
        if (item.cardId === null) {
          let { id } = await TrelloActionsController.__createProject(
            isProjectsList.listId,
            {
              name: item.name,
              projectDeadline: item.projectDeadline,
              startDate: item.startDate,
            }
          );
          if (id) {
            item.cardId = id;
            item.boardId = board.boardId;
            item.listId = isProjectsList.listId;
            await item.save();
          }
        }
      });
    }
    cb(null, true);
  });
};
