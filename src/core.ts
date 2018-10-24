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
  [key: string]: ActionReducer<TState, any>;
}

export interface ActionCreator<TPayload = void> {
  (): Action;
  (payload: TPayload): Action<TPayload>;
  type: string;
  reduce: <TState>(
    reducer: ActionReducer<TState, TPayload>
  ) => {
    [key: string]: ActionReducer<TState, TPayload>;
  };
}

export type ActionReducer<TState, TPayload> = (
  s: TState,
  p: TPayload
) => TState;
