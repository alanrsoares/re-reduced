import { combineReducers } from "redux";
import { dissoc, without, assoc, indexBy } from "ramda";

import { handleActions, match } from "../../src";

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

export const todos = handleActions<ToDosState>(
  [
    // fetch handlers
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
    // add handlers
    actions.todos.add.request.reduce(state => ({
      ...state,
      isAdding: true
    })),
    actions.todos.add.success.reduce((state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId),
      idList: state.idList.concat(todo.id),
      isAdding: false
    })),
    // update handlers
    actions.todos.update.reduce((state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId)
    })),
    // delete handlers
    actions.todos.delete.reduce((state, id) => ({
      ...state,
      byId: dissoc<ToDoMap>(id, state.byId),
      idList: without([id], state.idList)
    }))
  ],
  INITIAL_STATE.todos
);

export const tags = handleActions([], INITIAL_STATE.tags);

export default combineReducers<State>({
  todos,
  tags
});
