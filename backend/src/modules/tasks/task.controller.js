import { taskQueryController } from "./task-query.controller.js";
import { taskMutateController } from "./task-mutate.controller.js";

export const taskController = {
  ...taskQueryController,
  ...taskMutateController
};
