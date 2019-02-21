import { applyTo, merge, mergeAll } from "ramda";
import { Reducer } from "redux";

import { ActionReducerMap, ActionCreator, ActionReducer } from "./core";

export interface ReducerConfig<TActions, TState> {
  actions: TActions;
  idKey: string;
  initialState: TState;
}

export type ReducerFunctorFn<TActions, TState> = (
  config: ReducerConfig<TActions, TState>
) => ActionReducerMap<TState>;

export type ReducerFunctor<TActions, TState> =
  | Array<ReducerFunctorFn<TActions, TState>>
  | ReducerFunctorFn<TActions, TState>;

export interface ReducerFactory<TActions, TState> {
  (
    config: ReducerConfig<TActions, TState>,
    customHandlers?: ActionReducerMap<TState>
  ): Reducer<TState>;
  functor: ReducerFunctor<TActions, TState>;
}

export const reducerConfig = <TActions>(config: {
  actions: TActions;
}): ReducerConfig<TActions, any> => ({
  ...config,
  idKey: "id",
  initialState: undefined
});

export const reducerConfigWithId = <TActions>(config: {
  actions: TActions;
  idKey: string;
}): ReducerConfig<TActions, any> => ({
  ...config,
  initialState: undefined
});

export const reducerConfigWithState = <TActions, TState>(config: {
  actions: TActions;
  initialState: TState;
}): ReducerConfig<TActions, TState> => ({
  ...config,
  idKey: ""
});

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
 * registers a reducer handler for a given action
 *
 * @param action
 * @param reducer
 */
export function match<TPayload, TState>(
  action: ActionCreator<TPayload>,
  reducer: ActionReducer<TState, TPayload>
): ActionReducerMap<TState> {
  return action.reduce(reducer);
}

/**
 * registers a reducer handler for a collection of actions
 *
 * @param action
 * @param reducer
 */
export function matchN<TState, TActions extends Array<ActionCreator<any>>>(
  actions: Array<ActionCreator<InferPayload<TActions>>>,
  reducer: ActionReducer<TState, InferPayload<TActions>>
): ActionReducerMap<TState> {
  return actions.reduce(
    (acc, action) => ({
      ...acc,
      ...action.reduce(reducer)
    }),
    {}
  );
}

const combineFunctors = <TActions, TState>(
  functors: Array<ReducerFunctorFn<TActions, TState>>
) => (config: ReducerConfig<any, any>, customHandlers = {}) => {
  const handlers = mergeAll(functors.map(applyTo(config)));
  return merge(handlers, customHandlers) as ReducerFunctorFn<TActions, TState>;
};

export const createReducerFactory = <TActions, TState>(
  functor: ReducerFunctor<TActions, TState>,
  defaultInitialState: TState
) => {
  const finalFunctor = (Array.isArray(functor)
    ? combineFunctors<TActions, TState>(functor)
    : functor) as ReducerFunctorFn<TActions, TState>;

  const reducerFactory: ReducerFactory<TActions, TState> = (
    config,
    customHandlers = {}
  ) => {
    // patch initialState to config if not present
    const initialState =
      typeof config.initialState === "undefined"
        ? defaultInitialState
        : config.initialState;

    const handlers = merge(
      finalFunctor({ ...config, initialState }),
      customHandlers
    );

    return createReducer<TState>(handlers, initialState);
  };

  reducerFactory.functor = finalFunctor;

  return reducerFactory;
};
