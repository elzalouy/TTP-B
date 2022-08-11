import logger from "../../logger";
import TaskController from "../controllers/task";
import TechMemberController from "../controllers/techMember";

const Procedures = class Procedures {
  static async deleteDepartmentProcedure(department: any) {
    try {
      let tasksResult = await TaskController.deleteTasksWhere({
        boardId: department.boardId,
      });
      let techResult = await TechMemberController.deleteTechMemberWhere({
        departmentId: department._id,
      });
      logger.info({
        "delete Tasks": tasksResult,
        "Delete Tech members": techResult,
      });
      return department;
    } catch (error) {
      logger.error({ deleteDepartmentProcedureError: error });
    }
  }
};
export default Procedures;
