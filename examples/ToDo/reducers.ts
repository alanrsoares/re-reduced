import { combineReducers } from "redux";
import { dissoc, without, assoc, indexBy } from "ramda";

import { createReducer, match, matchN } from "../../src";

import actions from "./actions";
import { State, ToDoMap } from "./types";

const INITIAL_STATE: State = {
  byId: {},
  idList: [],
  isFetching: false,
  isAdding: false
};

const byId = createReducer<ToDoMap>(
  [
    match(actions.fetch.success, (_, payload) =>
      indexBy(todo => todo.id, payload)
    ),
    matchN([actions.add.success, actions.update.success], (state, todo) =>
      assoc(todo.id, todo, state)
    )
  ],
  INITIAL_STATE.byId
);

const idList = createReducer<string[]>(
  [
    match(actions.fetch.success, (_, payload) => payload.map(todo => todo.id)),
    match(actions.add.success, (state, todo) => state.concat(todo.id))
  ],
  INITIAL_STATE.idList
);

const isFetching = createReducer<boolean>(
  [
    match(actions.fetch.request, () => true),
    matchN([actions.fetch.success, actions.fetch.failure], () => false)
  ],
  INITIAL_STATE.isFetching
);

const isAdding = createReducer<boolean>(
  [
    match(actions.add.request, () => true),
    matchN([actions.add.success, actions.add.failure], () => false)
  ],
  INITIAL_STATE.isFetching
);

export const todos = createReducer<State>(
  [
    // [fetch] handlers
    match(actions.fetch.request, state => ({
      ...state,
      isFetching: true
    })),
    match(actions.fetch.success, (state, payload) => ({
      ...state,
      byId: indexBy(todo => todo.id, payload),
      idList: payload.map(todo => todo.id),
      isFetching: false
    })),
    // [add] handlers
    match(actions.add.request, state => ({
      ...state,
      isAdding: true
    })),
    match(actions.add.success, (state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId),
      idList: state.idList.concat(todo.id),
      isAdding: false
    })),
    // [update] handlers
    match(actions.update, (state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId)
    })),
    // [delete] handlers
    match(actions.delete, (state, id) => ({
      ...state,
      byId: dissoc<ToDoMap>(id, state.byId),
      idList: without([id], state.idList)
    }))
  ],
  INITIAL_STATE
);

export default combineReducers<State>({
  byId,
  idList,
  isAdding,
  isFetching
});
