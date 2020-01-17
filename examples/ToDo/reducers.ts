import { combineReducers } from "redux";

import dissoc from "ramda/src/dissoc";
import assoc from "ramda/src/assoc";
import indexBy from "ramda/src/indexBy";

import { createReducer, reduce, foldP } from "../../src";

import actions from "./actions";
import { State, ToDoMap } from "./types";

const INITIAL_STATE: State = {
  byId: {},
  idList: [],
  isFetching: false,
  isAdding: false,
};

const byId = createReducer<ToDoMap>(
  [
    reduce(actions.fetch.success, (_, todos) =>
      indexBy(todo => todo.id, todos)
    ),
    foldP([actions.add.success, actions.update], todo => assoc(todo.id, todo)),
    reduce(actions.delete, (state, todoId) => dissoc(todoId, state)),
  ],
  INITIAL_STATE.byId
);

const idList = createReducer<string[]>(
  [
    reduce(actions.fetch.success, (_, todos) => todos.map(todo => todo.id)),
    reduce(actions.add.success, (state, todo) => state.concat(todo.id)),
    reduce(actions.delete, (state, todoId) =>
      state.filter(id => id !== todoId)
    ),
  ],
  INITIAL_STATE.idList
);

const isFetching = createReducer<boolean>(
  [
    reduce(actions.fetch.request, () => true),
    reduce([actions.fetch.success, actions.fetch.failure], () => false),
  ],
  INITIAL_STATE.isFetching
);

const isAdding = createReducer<boolean>(
  [
    reduce(actions.add.request, () => true),
    reduce([actions.add.success, actions.add.failure], () => false),
  ],
  INITIAL_STATE.isAdding
);

export default combineReducers<State>({
  byId,
  idList,
  isFetching,
  isAdding,
});
