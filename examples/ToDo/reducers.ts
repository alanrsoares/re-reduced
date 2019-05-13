import { combineReducers } from "redux";

import dissoc from "ramda/src/dissoc";
import assoc from "ramda/src/assoc";
import indexBy from "ramda/src/indexBy";

import { createReducer, match } from "../../src";

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
    match(actions.fetch.success, (_, todos) => indexBy(todo => todo.id, todos)),
    match([actions.add.success, actions.update], (state, todo) =>
      assoc(todo.id, todo, state)
    ),
    match(actions.delete, (state, todoId) => dissoc(todoId, state)),
  ],
  INITIAL_STATE.byId
);

const idList = createReducer<string[]>(
  [
    match(actions.fetch.success, (_, todos) => todos.map(todo => todo.id)),
    match(actions.add.success, (state, todo) => state.concat(todo.id)),
    match(actions.delete, (state, todoId) => state.filter(id => id !== todoId)),
  ],
  INITIAL_STATE.idList
);

const isFetching = createReducer<boolean>(
  [
    match(actions.fetch.request, () => true),
    match([actions.fetch.success, actions.fetch.failure], () => false),
  ],
  INITIAL_STATE.isFetching
);

const isAdding = createReducer<boolean>(
  [
    match(actions.add.request, () => true),
    match([actions.add.success, actions.add.failure], () => false),
  ],
  INITIAL_STATE.isAdding
);

export default combineReducers<State>({
  byId,
  idList,
  isFetching,
  isAdding,
});
