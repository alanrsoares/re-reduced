export interface Action<T = void> {
  type: string;
  payload: T;
}

export interface AsyncActions<TRun, TSuccess, TError = Error>
  extends ActionCreator<TRun> {
  request: ActionCreator;
  success: ActionCreator<TSuccess>;
  failure: ActionCreator<TError>;
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
  state: TState,
  payload: TPayload
) => TState;
