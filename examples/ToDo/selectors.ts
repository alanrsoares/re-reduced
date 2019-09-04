import { createSelector } from "reselect";

import { State } from "./types";

export const getToDosById = (state: State) => state.byId;

export const getToDosIdList = (state: State) => state.idList;
export const getToDosIsFetching = (state: State) => state.isFetching;
export const getToDosIsAdding = (state: State) => state.isAdding;

export const getToDos = createSelector(
  getToDosById,
  getToDosIdList,
  (byId, idList) => idList.map(id => byId[id])
);

export const getActiveToDos = createSelector(
  getToDos,
  todos => todos.filter(todo => !todo.isCompleted)
);

export const getCompletedToDos = createSelector(
  getToDos,
  todos => todos.filter(todo => todo.isCompleted)
);
