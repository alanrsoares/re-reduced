import { createAction, createAsyncAction } from "../../src";
import { ToDo, Tag } from "./types";
import { string } from "prop-types";

export default {
  todos: {
    fetch: createAsyncAction<void, ToDo[]>("FETCH", "TODOS"),
    add: createAsyncAction<Partial<ToDo>, ToDo>("ADD", "TODOS"),
    update: createAsyncAction<ToDo, ToDo>("UPDATE", "TODOS"),
    delete: createAsyncAction<string, ToDo>("DELETE", "TODOS")
  },
  tags: {
    fetch: createAsyncAction<void, Tag[]>("FETCH", "TAGS")
  }
};
