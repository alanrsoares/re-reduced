export interface Action<T = void> {
  type: string;
  payload: T;
}

export interface AsyncActions<TRun, TSuccess> extends ActionCreator<TRun> {
  request: ActionCreator;
  success: ActionCreator<TSuccess>;
  failure: ActionCreator<Error>;
}

export interface ActionReducerMap<TState> {
  [key: string]: ActionReducer<any, TState>;
}

export interface ActionCreator<TPayload = void> {
  (): Action;
  (payload: TPayload): Action<TPayload>;
  type: string;
  reduce: <TState>(
    handler: ActionReducer<TPayload, TState>
  ) => {
    [key: string]: ActionReducer<TPayload, TState>;
  };
}

export type ActionReducer<TPayload, TState> = (
  s: TState,
  p: TPayload
) => TState;
