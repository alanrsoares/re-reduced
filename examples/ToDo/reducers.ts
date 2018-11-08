import { combineReducers } from "redux";
import { dissoc, without, assoc, indexBy } from "ramda";

import { handleActions } from "../../src";

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
    actions.todos.fetch.request.reduce(state => ({
      ...state,
      isFetching: true
    })),
    actions.todos.fetch.success.reduce((state, payload) => ({
      ...state,
      byId: indexBy(todo => todo.id, payload),
      idList: payload.map(todo => todo.id),
      isFetching: false
    })),
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
    actions.todos.update.reduce((state, todo) => ({
      ...state,
      byId: assoc(todo.id, todo, state.byId)
    })),
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
