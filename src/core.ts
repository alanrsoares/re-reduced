export interface Action<T = void, TMeta = any> {
  type: string;
  payload: T;
  meta?: TMeta;
}

export interface AsyncAction<TRun, TSuccess, TError = Error>
  extends ActionCreator<TRun> {
  request: ActionCreator;
  success: ActionCreator<TSuccess>;
  failure: ActionCreator<TError>;
}

export interface ActionReducerMap<TState> {
  [key: string]: ActionReducer<TState, any>;
}

export interface ActionCreator<TPayload = void, TMeta = any> {
  (): Action;
  (payload: TPayload, meta?: TMeta): Action<TPayload, TMeta>;
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
