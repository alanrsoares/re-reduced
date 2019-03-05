import { mergeAll } from "ramda";
import { Reducer } from "redux";

import { ActionReducerMap, ActionCreator, ActionReducer } from "./core";

export function createReducer<TState>(
  handlers: ActionReducerMap<TState> | Array<ActionReducerMap<TState>>,
  initialState: TState
): Reducer<TState> {
  const $handlers = Array.isArray(handlers)
    ? (mergeAll(handlers) as ActionReducerMap<TState>)
    : handlers;

  return (state = initialState, action) => {
    const actionReducer = $handlers[action.type];

    if (typeof actionReducer === "function") {
      return actionReducer(state, action.payload);
    }

    return state;
  };
}

// temporary alias for createReducer
export const handleActions = createReducer;

export type InferPayload<T> = T extends Array<ActionCreator<infer U>>
  ? U
  : T extends ActionCreator<infer P> ? P : never;

/**
 * registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export function match<
  TState,
  TActions extends ActionCreator<any> | Array<ActionCreator<any>>
>(
  actions: TActions,
  reducer: ActionReducer<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  if (Array.isArray(actions)) {
    return actions.reduce(
      (acc, action) => ({
        ...acc,
        ...action.reduce(reducer)
      }),
      {}
    );
  } else {
    return (actions as ActionCreator<InferPayload<TActions>>).reduce(reducer);
  }
}
