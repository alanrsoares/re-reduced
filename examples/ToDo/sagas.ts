import { takeLatest, all } from "redux-saga/effects";

import actions from "./actions";
import * as api from "./api";

import { apiWorkerFactory } from "../../src";
import { ToDo, Tag } from "./types";

export const fetchToDos = apiWorkerFactory<void, ToDo[]>(
  actions.todos.fetch,
  api.fetchToDos
);

export const addToDos = apiWorkerFactory<Partial<ToDo>, ToDo>(
  actions.todos.add,
  api.addToDo
);

export const updateToDo = apiWorkerFactory<ToDo, ToDo>(
  actions.todos.update,
  api.patchToDo
);

export const fetchTags = apiWorkerFactory<void, Tag[]>(
  actions.tags.fetch,
  api.fetchTags
);

export default function* sagaWatcher() {
  yield all([
    takeLatest(actions.todos.fetch.type, fetchToDos),
    takeLatest(actions.todos.add.type, addToDos),
    takeLatest(actions.todos.update.type, updateToDo),
    takeLatest(actions.tags.fetch.type, fetchTags)
  ]);
}
