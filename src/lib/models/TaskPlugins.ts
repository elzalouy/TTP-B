import { model, Schema } from "mongoose";
import { TaskPlugin, TasksPluginsModel } from "../types/model/TaskPlugins";

const PluginSchema = new Schema<TaskPlugin>({
  taskId: String,
  cardId: String,
  name: String,
  checkLists: [
    {
      id: String,
      name: String,
      idBoard: String,
      idCard: String,
      pos: Number,
      checkItems: [
        {
          id: String,
          name: String,
          nameData: { emoji: {} },
          pos: Number,
          state: String,
          due: String,
          dueReminder: String,
          idMember: String,
          idChecklist: String,
        },
      ],
    },
  ],
  labels: [
    {
      id: String,
      idBoard: String,
      name: String,
      color: String,
      uses: Number,
    },
  ],
  comments: [{ comment: String }],
});
const TasksPlugins = model<TaskPlugin, TasksPluginsModel>(
  "TasksPlugins",
  PluginSchema
);
export default TasksPlugins;
