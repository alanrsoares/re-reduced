export interface Action<T = void> {
    type: string;
    payload: T;
}
export interface AsyncActions<TRun, TSuccess> extends ActionCreator<TRun> {
    request: ActionCreator;
    success: ActionCreator<TSuccess>;
    failure: ActionCreator<Error>;
}
export interface ActionHandlerMap<TState> {
    [key: string]: ActionHandler<any, TState>;
}
export interface ActionCreator<T = void> {
    (): Action;
    (payload: T): Action<T>;
    type: string;
}
export declare type ActionHandler<TPayload, TState> = (p: TPayload, s: TState) => TState;
