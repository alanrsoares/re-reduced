import { Reducer } from "redux";
import mergeAll from "ramda/src/mergeAll";
import merge from "ramda/src/merge";

import {
  ActionReducerMap,
  ActionCreator,
  ActionReducer,
  ActionFolder,
} from "./core";

export function createReducer<TState>(
  handlers: ActionReducerMap<TState> | ActionReducerMap<TState>[],
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

/**
 *  @deprecated temporary alias for createReducer
 */
export const handleActions = createReducer;

export type InferPayload<T> = T extends ActionCreator<infer U>[]
  ? U
  : T extends ActionCreator<infer P>
  ? P
  : never;

/**
 * registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export function match<
  TState,
  TActions extends ActionCreator<any> | ActionCreator<any>[]
>(
  actions: TActions,
  reducer: ActionReducer<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  return Array.isArray(actions)
    ? actions.reduce(
        (acc: ActionReducerMap<TState>, action: ActionCreator<any>) =>
          merge(acc, action.reduce(reducer)),
        {}
      )
    : (actions as ActionCreator<InferPayload<TActions>>).reduce(reducer);
}

/**
 * registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export function matchF<
  TState,
  TActions extends ActionCreator<any> | ActionCreator<any>[]
>(
  actions: TActions,
  reducer: ActionFolder<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  return Array.isArray(actions)
    ? actions.reduce(
        (acc: ActionReducerMap<TState>, action: ActionCreator<any>) =>
          merge(acc, action.fold(reducer)),
        {}
      )
    : (actions as ActionCreator<InferPayload<TActions>>).fold(reducer);
}

/**
 * pointfree helper for action.reduce
 */
export const reduce = match;

/**
 * pointfree helper for action.fold
 */
export const fold = matchF;
