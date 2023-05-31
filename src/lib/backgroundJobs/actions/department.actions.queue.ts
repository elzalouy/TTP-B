import queue from "queue";
import DepartmentController from "../../controllers/department";
import TrelloActionsController from "../../controllers/trello";
import Project from "../../models/Project";
import { IDepartment } from "../../types/model/Department";
import { ProjectInfo } from "../../types/model/Project";

export const departmentsQueue = queue({ results: [], autostart: true });
