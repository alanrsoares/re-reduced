import { merge, mergeAll, applyTo } from "ramda";
import { AnyAction, Reducer } from "redux";

import { ActionHandlerMap } from "./core";

export interface ReducerConfig<TActions, TState> {
  actions: TActions;
  idKey: string;
  initialState: TState;
}

export type ReducerFunctorFn<TActions, TState> = (
  config: ReducerConfig<TActions, TState>
) => ActionHandlerMap<TState>;

export type ReducerFunctor<TActions, TState> =
  | Array<ReducerFunctorFn<TActions, TState>>
  | ReducerFunctorFn<TActions, TState>;

export interface ReducerFactory<TActions, TState> {
  (
    config: ReducerConfig<TActions, TState>,
    customHandlers?: ActionHandlerMap<TState>
  ): Reducer<TState, AnyAction>;
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
}): ReducerConfig<TActions, any> => ({
  ...config,
  idKey: ""
});

export const handleActions = <TState>(
  actionHandlers: ActionHandlerMap<TState>,
  initialState: TState
): Reducer<TState, AnyAction> => (state = initialState, action) => {
  const actionHandler = actionHandlers[action.type];

  if (typeof actionHandler === "function") {
    return actionHandler(action.payload, state);
  }

  return state;
};

const combineFunctors = <TActions, TState>(
  functors: Array<ReducerFunctorFn<TActions, TState>>
) => (config: ReducerConfig<any, any>, customHandlers = {}) => {
  const handlers = mergeAll(functors.map(applyTo(config)));
  return merge(handlers, customHandlers) as ReducerFunctorFn<TActions, TState>;
};

export const createReducer = <TActions, TState>(
  functor: ReducerFunctor<TActions, TState>,
  defaultInitialState: TState
) => {
  const finalFunctor = (Array.isArray(functor)
    ? combineFunctors<TActions, TState>(functor)
    : functor) as ReducerFunctorFn<TActions, TState>;

  const reducerFactory = ((
    config: ReducerConfig<TActions, TState>,
    customHandlers = {}
  ) => {
    // patch initialState to config if not present
    const initialState =
      typeof config.initialState === "undefined"
        ? defaultInitialState
        : config.initialState;

    const actionHandlers = merge(
      finalFunctor({ ...config, initialState }),
      customHandlers
    );

    return handleActions<TState>(actionHandlers, initialState);
  }) as ReducerFactory<TActions, TState>;

  reducerFactory.functor = finalFunctor;

  return reducerFactory;
};
