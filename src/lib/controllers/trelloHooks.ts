import Department from "../models/Department";
import { validateExtentions } from "../services/validation";
import { webhookUpdateInterface } from "../types/controller/trello";
import { TaskData } from "../types/model/tasks";
import TaskController from "./task";
import config from "config";
import Project from "../models/Project";
import { io } from "../..";
import TrelloActionsController from "./trello";
import logger from "../../logger";
import ProjectController from "./project";

export default class TrelloWebhook {
  actionRequest: webhookUpdateInterface;
  type: string;
  action: string;
  task: TaskData;
  user: { id: string; name: string };
  hookTarget: "project" | "task";

  constructor(action: webhookUpdateInterface, target?: "project" | "task") {
    this.hookTarget = target;
    this.type = action.action?.type;
    this.action = action.action?.display?.translationKey;
    this.actionRequest = action;
    this.user = {
      id: action?.action?.memberCreator?.id,
      name: action?.action?.memberCreator?.fullName,
    };
    this.task = {
      cardId: action.action?.data?.card?.id,
      name: action.action?.data?.card?.name,
      boardId: action.action?.data?.board?.id,
    };
  }

  async start() {
    if (this.hookTarget === "task")
      switch (this.type) {
        case "addAttachmentToCard":
          return await this.addAttachmentToCard();
        case "deleteAttachmentFromCard":
          return await this.deleteAttachmentFromCard();
        case "createCard":
          return await this.createCard();
        case "copyCard":
          return await this.createCard();
        case "deleteCard":
          return await this.deleteCard();
        case "updateCard":
          return await this.updateCard();

        case "moveCardToBoard":
          return await this.updateCard();
        default:
          break;
      }
    else if (this.hookTarget === "project") {
      switch (this.type) {
        case "createCard":
          return await this.createProject();
        case "deleteCard":
          return await this.deleteProject();
        case "updateCard":
          return await this.updateProject();
        default:
          break;
      }
    }
  }

  private async addAttachmentToCard() {
    let task = await TaskController.getOneTaskBy({
      cardId: this.actionRequest?.action?.data?.card?.id,
    });
    if (task) {
      this.task = { ...task };
      this.task.attachedFile = {
        trelloId: this.actionRequest.action.data?.attachment?.id,
        name: this.actionRequest.action.data?.attachment?.name,
        url: this.actionRequest.action.data.attachment?.url,
        mimeType: validateExtentions(
          this.actionRequest.action.data?.attachment?.name
        ),
      };
      return await TaskController.updateTaskByTrelloDB(this.task, this.user);
    }
  }

  private async deleteAttachmentFromCard() {
    let task = await TaskController.getOneTaskBy({
      cardId: this.actionRequest?.action?.data?.card?.id,
    });
    if (task) {
      this.task = { ...task };
      this.task.deleteFiles = {
        trelloId: this.actionRequest.action.data.attachment.id,
        name: this.actionRequest.action.data.attachment.name,
      };
      return await TaskController.updateTaskByTrelloDB(this.task, this.user);
    }
  }

  private async createCard() {
    try {
      let listId =
        this.actionRequest.action.data?.list?.id ??
        this.actionRequest.action.data?.card?.idList ??
        this.actionRequest.action.data?.listAfter?.id;
      let task = await TaskController.getOneTaskBy({
        cardId: this.actionRequest?.action?.data?.card?.id,
      });
      let dep = await Department.findOne({
        boardId: this.actionRequest.action.data?.board?.id,
      });
      let team = await dep.teams.find((item) => listId === item.listId);
      if (!task && dep) {
        this.task = {
          ...this.task,
          trelloShortUrl: `https://trello.com/c/${this.actionRequest.action.data.card.shortLink}`,
          deadline: this.actionRequest.action?.data?.card?.due
            ? new Date(this.actionRequest.action?.data?.card?.due)
            : undefined,
          start: this.actionRequest.action?.data?.card?.start
            ? new Date(this.actionRequest.action?.data?.card?.start)
            : new Date(Date.now()),
          teamId: team?._id ?? null,
          status: team
            ? "In Progress"
            : this.actionRequest.action.data.list.name,
          listId: listId,
          movements: [
            {
              status: team
                ? "In Progress"
                : this.actionRequest.action.data.list.name,
              movedAt: new Date(Date.now()).toString(),
            },
          ],
          assignedAt:
            team && this.actionRequest?.action?.data?.listBefore?.id
              ? new Date(Date.now())
              : this.task.assignedAt,
        };
        console.log({ createTask: listId, movements: this.task.movements });
        return await TaskController.createTaskByTrello(this.task);
      }
    } catch (error) {
      logger.error({ createCardHook: error });
    }
  }

  private async deleteCard() {
    try {
      let task = await TaskController.getOneTaskBy({
        cardId: this.actionRequest?.action?.data?.card?.id,
      });
      if (task) return await TaskController.deleteTaskByTrelloDB(task);
      else return null;
    } catch (error) {
      logger.error({ deleteCardHook: error });
    }
  }

  private async updateCard() {
    try {
      let task = await TaskController.getOneTaskBy({
        cardId: this.actionRequest?.action?.data?.card?.id,
      });
      if (task) {
        let department = await Department.findOne({
          boardId: task.boardId,
        });
        let listId =
          this.actionRequest.action.data?.list?.id ??
          this.actionRequest.action.data?.card?.idList ??
          this.actionRequest.action.data?.listAfter?.id;
        let isMoved = listId !== task.listId;
        let status =
          this.actionRequest.action.data?.list?.name ??
          this.actionRequest.action.data?.listAfter?.name;
        let newDep =
          (await Department.findOne({
            boardId: this.actionRequest.action.data.board.id,
          })) ?? null;
        let isNewTeam =
          (newDep ?? department).teams.find((item) => item.listId === listId) ??
          null;
        let inProgressList = (newDep ?? department).lists.find(
          (item) => isNewTeam?.listId && item.name === "In Progress"
        );
        this.task = {
          name: this.actionRequest.action.data.card.name,
          boardId: this.actionRequest.action.data.board.id,
          cardId: this.actionRequest.action.data.card.id,
          deadline: this.actionRequest?.action?.data?.card?.due
            ? new Date(this.actionRequest?.action?.data?.card?.due)
            : task.deadline ?? null,
          start: this.actionRequest.action?.data?.card?.start
            ? new Date(this.actionRequest.action?.data?.card?.start)
            : task.start ?? null,
          description:
            this.actionRequest.action.data.card.desc ?? task.description,
          teamId: isNewTeam?._id ?? task.teamId,
          listId: listId,
          status: inProgressList?.name ?? status,
          movements: task.movements,
          teamListId: isNewTeam ? listId : task.teamListId,
        };
        // if (isMoved)
        //   this.task.movements.push({
        //     status: inProgressList?.name ? inProgressList.name : status,
        //     movedAt: new Date(Date.now()).toString(),
        //   });
        console.log({ updateTask: listId, movements: this.task.movements });

        return await TaskController.updateTaskByTrelloDB(this.task, {
          id: this.user.id,
          name: this.user.name,
        });
      } else this.updateProject();
    } catch (error) {
      logger.error({ updateCardHook: error });
    }
  }

  private async createProject() {
    try {
      let existed = await Project.find({
        cardId: this.actionRequest.action.data.card.id,
      });
      if (existed) return await this.updateProject();
      else {
        await TrelloActionsController.deleteCard(
          this.actionRequest.action.data.card.id
        );
      }
    } catch (error) {
      logger.error({ createProjectHook: error });
    }
  }

  private updateProject() {
    try {
      Department.findOne({
        boardId: this.actionRequest.action.data.board.id,
      }).then(async (creativeBoard) => {
        if (creativeBoard) {
          // if true, then it's an update action, and if not so it's a move action and moving is not allowed
          let project = await Project.findOneAndUpdate(
            { cardId: this.actionRequest.action.data.card.id },
            {
              boardId: this.actionRequest.action.data.board.id,
              listId: this.actionRequest.action.data.card.idList,
              cardId: this.actionRequest.action.data.card.id,
              name: this.actionRequest.action.data.card.name,
              projectDeadline: this.actionRequest.action.data.card.due,
              startDate: this.actionRequest.action.data.card.start,
            },
            { new: true }
          );
          io.sockets.emit("update-projects", project);
        }
      });
    } catch (error) {
      logger.error({ updateProjectHook: error });
    }
  }

  private async deleteProject() {
    try {
      // when deleting from ttp, we must make sure that it is working in async with the trello deletion process.
      let data = this.actionRequest.action.data.card;
      let project = await Project.findOne({ cardId: data.id });
      if (project) {
        await TrelloActionsController.__createProject(
          this.actionRequest.action.data.list.id,
          {
            name: project.name,
            projectDeadline: project.projectDeadline,
            startDate: project.startDate,
          }
        ).then(async ({ id }: { id: string }) => {
          project.cardId = id;
          project.boardId = this.actionRequest.action.data.board.id;
          project.listId = data.idList;
          let result = await project.save();
          io.sockets.emit("update-projects", result);
        });
      }
    } catch (error) {
      logger.error({ deleteProjectHook: error });
    }
  }
}
