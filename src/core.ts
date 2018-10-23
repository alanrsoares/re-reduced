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

export interface ActionCreator<TPayload = void> {
  (): Action;
  (payload: TPayload): Action<TPayload>;
  type: string;
  reduce: <TState>(
    handler: ActionHandler<TPayload, TState>
  ) => {
    [key: string]: ActionHandler<TPayload, TState>;
  };
}

export type ActionHandler<TPayload, TState> = (
  p: TPayload,
  s: TState
) => TState;
