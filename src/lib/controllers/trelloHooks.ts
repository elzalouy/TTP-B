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

export default class TrelloWebhook {
  actionRequest: webhookUpdateInterface;
  type: string;
  action: string;
  task: TaskData;
  hookTarget: "project" | "task";
  constructor(action: webhookUpdateInterface, target?: "project" | "task") {
    this.hookTarget = target;
    this.type = action.action?.type;
    this.action = action.action?.display?.translationKey;
    this.actionRequest = action;
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
        case "deleteCard":
          return await this.deleteCard();
        case "updateCard":
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
      return await TaskController.updateTaskByTrelloDB(this.task);
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
      return await TaskController.updateTaskByTrelloDB(this.task);
    }
  }

  private async createCard() {
    try {
      let task = await TaskController.getOneTaskBy({
        cardId: this.actionRequest?.action?.data?.card?.id,
      });
      let dep = await Department.findOne({
        boardId: this.actionRequest.action.data?.board?.id,
      });
      let team = await dep.teams.find(
        (item) => this.actionRequest.action.data?.list?.id === item.listId
      );
      if (!task && dep) {
        this.task = {
          cardId: this.actionRequest.action.data.card.id,
          name: this.actionRequest.action.data.card.name,
          boardId: this.actionRequest.action.data.board.id,
          trelloShortUrl: `https://trello.com/c/${this.actionRequest.action.data.card.shortLink}`,
          deadline: this.actionRequest.action.data.card.due
            ? new Date(this.actionRequest.action.data.card.due)
            : undefined,
          start: this.actionRequest.action.data.card.start
            ? new Date(this.actionRequest.action.data.card.start)
            : undefined,
          // check
          teamId: team ? team._id : null,
          status: team
            ? "inProgress"
            : this.actionRequest.action.data.list.name,
          listId: team
            ? dep.lists.find((item) => item.name === "inProgress").listId
            : this.actionRequest.action.data.list.id,
        };
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
        let isNewTeam = department.teams.find(
          (item) => item.listId === this.actionRequest.action.data.card.idList
        );
        let isBeforeTeam = department.teams.find(
          (item) =>
            this.actionRequest.action.data?.listBefore?.id === item.listId
        );
        this.task = {
          name: this.actionRequest.action.data.card.name,
          boardId: this.actionRequest.action.data.board.id,
          cardId: this.actionRequest.action.data.card.id,
          deadline:
            this.actionRequest.action.data.card.due !== undefined
              ? this.actionRequest.action?.data?.card?.due === null
                ? null
                : new Date(this.actionRequest.action.data.card.due)
              : task.deadline,
          start: this.actionRequest.action.data.card.start
            ? new Date(this.actionRequest.action.data.card.start)
            : task.start
            ? task.start
            : undefined,
          description: this.actionRequest.action.data.card.desc
            ? this.actionRequest.action.data.card.desc
            : task.description
            ? task.description
            : undefined,
          lastMove: isBeforeTeam
            ? task.lastMove
            : this.actionRequest.action.data?.listBefore?.name,
          lastMoveDate: isBeforeTeam
            ? task.lastMoveDate
            : new Date().toString(),
          teamId: isNewTeam ? isNewTeam._id : task.teamId,
          listId: isNewTeam
            ? task.listId
            : this.actionRequest.action.data.listAfter?.id,
          status: isNewTeam
            ? task.status
            : this.actionRequest.action.data.listAfter?.name,
        };
        return await TaskController.updateTaskByTrelloDB(this.task);
      }
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
        // there is no option to create a project from trello, cause there is no clientId, or projectManager
        // let project = new Project({
        //   name: data.name,
        //   projectDeadline: data.due,
        //   clientId
        // })
      }
    } catch (error) {
      logger.error({ createProjectHook: error });
    }
  }

  private updateProject() {
    try {
      Department.findOne({
        boardId: this.actionRequest.action.data.board.id,
      }).then((creativeBoard) => {
        // if true, then it's an update action, and if not so it's a move action and moving is not allowed
        let projectsList = creativeBoard.lists.find(
          (item) => item.name === "projects"
        ).listId;
        Project.findOneAndUpdate(
          { cardId: this.actionRequest.action.data.card.id },
          {
            boardId: creativeBoard.boardId,
            listId: projectsList,
            cardId: this.actionRequest.action.data.card.id,
            name: this.actionRequest.action.data.card.name,
            projectDeadline: this.actionRequest.action.data.card.due,
            startDate: this.actionRequest.action.data.card.start,
          },
          { new: true }
        ).then((res) => {
          io.sockets.emit("update-projects", res);
        });
        if (
          creativeBoard.name.toLowerCase() !== config.get("CreativeBoard") ||
          creativeBoard.lists.find((item) => item.name === "projects")
            .listId !== this.actionRequest.action.data.card.idList
        ) {
          TrelloActionsController.__updateCard({
            cardId: this.actionRequest.action.data.card.id,
            data: {
              idList: projectsList,
              idBoard: creativeBoard.boardId,
              name: this.actionRequest.action.data.card.name,
              due: this.actionRequest.action.data.card.due,
              start: this.actionRequest.action.data.card.start,
            },
          });
        }
      });
    } catch (error) {
      logger.error({ updateProjectHook: error });
    }
  }

  private async deleteProject() {
    try {
      let data = this.actionRequest.action.data.card;
      let project = await Project.findOne({ cardId: data.id });
      let deleteResult = await TaskController.deleteTasksByProjectId(
        project._id
      );
      if (project && deleteResult) {
        await Project.deleteOne({ _id: project._id });
        io.sockets.emit("delete-project", project);
      }
    } catch (error) {
      logger.error({ deleteProjectHook: error });
    }
  }
}
