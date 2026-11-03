import { addDependency } from "./dependency-add.service.js";
import {
  listDependencies,
  removeDependency
} from "./dependency-manage.service.js";

export const dependencyService = {
  add: addDependency,
  list: listDependencies,
  remove: removeDependency
};
