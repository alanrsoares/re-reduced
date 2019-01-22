import { createSelector } from "../../src";

import { State } from "./types";

export const getToDosById = (state: State) => state.todos.byId;

export const getToDosIdList = (state: State) => state.todos.idList;
export const getToDosIsFetching = (state: State) => state.todos.isFetching;
export const getToDosIsAdding = (state: State) => state.todos.isAdding;

export const getToDos = createSelector(
  getToDosById,
  getToDosIdList,
  (byId, idList) => idList.map(id => byId[id])
);

export const getActiveToDos = createSelector(getToDos, todos =>
  todos.filter(todo => !todo.isCompleted)
);

export const getCompletedToDos = createSelector(getToDos, todos =>
  todos.filter(todo => todo.isCompleted)
);
