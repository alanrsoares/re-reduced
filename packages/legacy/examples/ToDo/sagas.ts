import { all, takeLatest } from "redux-saga/effects";
import { apiWorkerFactory } from "../../src";
import actions from "./actions";
import * as api from "./api";
import type { ToDo } from "./types";

export const fetchToDos = apiWorkerFactory<ToDo[]>(
  actions.fetch,
  api.fetchToDos,
);

export const addToDos = apiWorkerFactory<ToDo, Partial<ToDo>>(
  actions.add,
  api.addToDo,
);

export const updateToDo = apiWorkerFactory<ToDo, ToDo>(
  actions.update,
  api.patchToDo,
);

export const deleteToDo = apiWorkerFactory<string, string>(
  actions.delete,
  api.deleteToDo,
);

export default function* sagaWatcher() {
  yield all([
    takeLatest(actions.fetch.type, fetchToDos),
    takeLatest(actions.add.type, addToDos),
    takeLatest(actions.update.type, updateToDo),
    takeLatest(actions.delete.type, deleteToDo),
  ]);
}
