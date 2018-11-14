import { combineReducers } from "redux";
import { dissoc, without, assoc, indexBy } from "ramda";

import { createReducer, match } from "../../src";

import actions from "./actions";
import { State, ToDosState, ToDoMap } from "./types";

const INITIAL_STATE: State = {
  todos: {
    byId: {},
    idList: [],
    isFetching: false,
    isAdding: false
  },
  tags: {
    byId: {},
    idList: []
  }
};

export const todos = createReducer<ToDosState>(
  [
    // [fetch] handlers
    match(actions.todos.fetch.request, state => ({
      ...state,
      isFetching: true
    })),
    match(actions.todos.fetch.success, (state, payload) => ({
      ...state,
      byId: indexBy(todo => todo.id, payload),
      idList: payload.map(todo => todo.id),
      isFetching: false
    })),
    // [add] handlers
    match(actions.todos.add.request, state => ({
      ...state,
      isAdding: true
    })),
    match(actions.todos.add.success, (state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId),
      idList: state.idList.concat(todo.id),
      isAdding: false
    })),
    // [update] handlers
    match(actions.todos.update, (state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId)
    })),
    // [delete] handlers
    match(actions.todos.delete, (state, id) => ({
      ...state,
      byId: dissoc<ToDoMap>(id, state.byId),
      idList: without([id], state.idList)
    }))
  ],
  INITIAL_STATE.todos
);

export const tags = createReducer([], INITIAL_STATE.tags);

export default combineReducers<State>({
  todos,
  tags
});
