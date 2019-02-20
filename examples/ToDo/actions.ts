import { createAction, createAsyncAction } from "../../src";
import { ToDo, Tag } from "./types";
import { string } from "prop-types";

export default {
  todos: {
    fetch: createAsyncAction<ToDo[]>("FETCH", "TODOS"),
    add: createAsyncAction<ToDo, Partial<ToDo>>("ADD", "TODOS"),
    update: createAsyncAction<ToDo, ToDo>("UPDATE", "TODOS"),
    delete: createAsyncAction<string, string>("DELETE", "TODOS")
  },
  tags: {
    fetch: createAsyncAction<Tag[]>("FETCH", "TAGS")
  }
};
