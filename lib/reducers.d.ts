import { Reducer } from "redux";
import { ActionReducerMap, ActionCreator, ActionReducer } from "./core";
export interface ReducerConfig<TActions, TState> {
    actions: TActions;
    idKey: string;
    initialState: TState;
}
export declare type ReducerFunctorFn<TActions, TState> = (config: ReducerConfig<TActions, TState>) => ActionReducerMap<TState>;
export declare type ReducerFunctor<TActions, TState> = Array<ReducerFunctorFn<TActions, TState>> | ReducerFunctorFn<TActions, TState>;
export interface ReducerFactory<TActions, TState> {
    (config: ReducerConfig<TActions, TState>, customHandlers?: ActionReducerMap<TState>): Reducer<TState>;
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
export declare function createReducer<TState>(handlers: ActionReducerMap<TState> | Array<ActionReducerMap<TState>>, initialState: TState): Reducer<TState>;
export declare const handleActions: typeof createReducer;
export declare type InferPayload<T> = T extends Array<ActionCreator<infer U>> ? U : T extends ActionCreator<infer P> ? P : never;
/**
 * registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
export declare function match<TState, TActions extends ActionCreator<any> | Array<ActionCreator<any>>>(actions: TActions, reducer: ActionReducer<TState, InferPayload<TActions>>): ActionReducerMap<TState>;
export declare const createReducerFactory: <TActions, TState>(functor: ReducerFunctor<TActions, TState>, defaultInitialState: TState) => ReducerFactory<TActions, TState>;
