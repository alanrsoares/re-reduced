import { Reducer, AnyAction } from "redux";
import mergeAll from "ramda/src/mergeAll";
import merge from "ramda/src/merge";

import {
  ActionReducerMap,
  ActionCreator,
  ActionReducer,
  ActionFolder,
  PartialActionReducer,
  PartialActionFolder,
} from "./core";

/**
 * Creates a redux standard reducer for a state `TState` from an `ActionHandlerMap<State>`
 *
 * @param handlers
 * @param initialState
 */
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
 * Composes any number of reducers of a state type TState into a single reducer of that state type
 *
 * @param reducers
 */
export function composeReducers<TState>(...reducers: Reducer<TState>[]) {
  return (<TAction extends AnyAction>(state: TState, action: TAction) =>
    reducers.reduce(
      (nextState, reducer) => reducer(nextState, action),
      state
    )) as Reducer<TState, AnyAction>;
}

/**
 *  @deprecated temporary alias for createReducer
 * this alias will be removed in v3.x
 */
export const handleActions = createReducer;

export type InferPayload<T> = T extends ActionCreator<infer U>[]
  ? U
  : T extends ActionCreator<infer P>
  ? P
  : never;

/**
 * Registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export function reduce<
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
 * Registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export function reduceP<
  TState,
  TActions extends ActionCreator<any> | ActionCreator<any>[]
>(
  actions: TActions,
  reducer: PartialActionReducer<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  return Array.isArray(actions)
    ? actions.reduce(
        (acc: ActionReducerMap<TState>, action: ActionCreator<any>) =>
          merge(acc, action.reduceP(reducer)),
        {}
      )
    : (actions as ActionCreator<InferPayload<TActions>>).reduceP(reducer);
}

/**
 * Registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export function fold<
  TState,
  TActions extends ActionCreator<any> | ActionCreator<any>[]
>(
  actions: TActions,
  reducer: ActionFolder<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  return Array.isArray(actions)
    ? actions.reduce<ActionReducerMap<TState>>(
        (acc, action: ActionCreator<any>) => merge(acc, action.fold(reducer)),
        {}
      )
    : (actions as ActionCreator<InferPayload<TActions>>).fold(reducer);
}

/**
 * Registers a reducer handler for one or multiple actions
 *
 * @template TState - the reducer state
 * @template TActions
 *
 * @param actions - a single action creator or multiple action creators
 * @param reducer - a `PartialActionFolder`: TPayload -> TState -> TState
 */
export function foldP<
  TState,
  TActions extends ActionCreator<any> | ActionCreator<any>[]
>(
  actions: TActions,
  reducer: PartialActionFolder<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  return Array.isArray(actions)
    ? actions.reduce<ActionReducerMap<TState>>(
        (acc, action: ActionCreator<any>) => merge(acc, action.foldP(reducer)),
        {}
      )
    : (actions as ActionCreator<InferPayload<TActions>>).foldP(reducer);
}

/**
 *  @deprecated temporary alias for `reduce`
 * this alias will be removed in v3.x
 */
export const match = reduce;

/**
 *  @deprecated temporary alias for `foldP`
 * this alias will be removed in v3.x
 */
export const matchF = foldP;
