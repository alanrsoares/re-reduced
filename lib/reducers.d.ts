import { Reducer } from "redux";
import { ActionHandlerMap } from "./core";
export interface ReducerConfig<TActions, TState> {
    actions: TActions;
    idKey: string;
    initialState: TState;
}
export declare type ReducerFunctorFn<TActions, TState> = (config: ReducerConfig<TActions, TState>) => ActionHandlerMap<TState>;
export declare type ReducerFunctor<TActions, TState> = Array<ReducerFunctorFn<TActions, TState>> | ReducerFunctorFn<TActions, TState>;
export interface ReducerFactory<TActions, TState> {
    (config: ReducerConfig<TActions, TState>, customHandlers?: ActionHandlerMap<TState>): Reducer<TState>;
    functor: ReducerFunctor<TActions, TState>;
}
export declare const reducerConfig: <TActions>(config: {
    actions: TActions;
}) => ReducerConfig<TActions, any>;
export declare const reducerConfigWithId: <TActions>(config: {
    actions: TActions;
    idKey: string;
}) => ReducerConfig<TActions, any>;
export declare const reducerConfigWithState: <TActions, TState>(config: {
    actions: TActions;
    initialState: TState;
}) => ReducerConfig<TActions, TState>;
export declare const handleActions: <TState>(handlers: ActionHandlerMap<TState>, initialState: TState) => Reducer<TState, import("redux").AnyAction>;
export declare const createReducer: <TActions, TState>(functor: ReducerFunctor<TActions, TState>, defaultInitialState: TState) => ReducerFactory<TActions, TState>;
