import { combineReducers } from "redux";

import { handleActions } from "../../src";

import actions from "./actions";
import { State, ToDosState } from "./types";

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
      byId: payload.reduce(
        (acc, todo) => ({
          ...acc,
          [todo.id]: todo
        }),
        {}
      ),
      idList: payload.map(todo => todo.id),
      isFetching: false
    })),
    actions.todos.add.request.reduce(state => ({
      ...state,
      isAdding: true
    })),
    actions.todos.add.success.reduce((state, todo) => ({
      ...state,
      byId: {
        ...state.byId,
        [todo.id]: todo
      },
      idList: state.idList.concat(todo.id),
      isAdding: false
    })),
    actions.todos.update.success.reduce((state, todo) => ({
      ...state,
      byId: {
        ...state.byId,
        [todo.id]: todo
      }
    }))
  ],
  INITIAL_STATE.todos
);

export const tags = handleActions([], INITIAL_STATE.tags);

export default combineReducers<State>({
  todos,
  tags
});
