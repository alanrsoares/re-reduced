import { createActions } from "../../src";
import type { ToDo } from "./types";

export default createActions("TODOS", (create) => ({
  fetch: create.asyncAction<ToDo[]>(),
  add: create.asyncAction<ToDo, Partial<ToDo>>(),
  update: create.asyncAction<ToDo, ToDo>(),
  delete: create.asyncAction<string, string>(),
}));
