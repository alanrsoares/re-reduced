export interface Action<T = void, TMeta = any> {
  type: string;
  payload: T;
  meta?: TMeta;
  error?: boolean;
}

export interface AsyncAction<TRun, TSuccess, TError = Error>
  extends ActionCreator<TRun> {
  request: ActionCreator;
  success: ActionCreator<TSuccess>;
  failure: ActionCreator<TError>;
}

export type ActionReducer<TState, TPayload> = (
  state: TState,
  payload: TPayload
) => TState;

export interface ActionReducerMap<TState> {
  [key: string]: ActionReducer<TState, any>;
}

export interface ActionCreatorOptions<TMeta> {
  meta?: TMeta;
  error?: boolean;
}

export interface ActionCreator<TPayload = void, TMeta = any> {
  (): Action;
  (options?: ActionCreatorOptions<TMeta>): Action<any, TMeta>;
  (payload: TPayload, options?: ActionCreatorOptions<TMeta>): Action<
    TPayload,
    TMeta
  >;
  type: string;
  reduce<TState>(
    reducer: ActionReducer<TState, TPayload>
  ): {
    [key: string]: ActionReducer<TState, TPayload>;
  };
}
