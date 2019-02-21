/**
 * A Flux-Standard-Action (FSA)
 */
export interface Action<T = void, TMeta = any> {
  type: string;
  payload: T;
  meta?: TMeta;
  error?: boolean;
}

/**
 * A composite Action to handle async workflows with nested actions for request, success and failure
 */
export interface AsyncAction<TResult, TPayload = void, TError = Error>
  extends ActionCreator<TPayload> {
  request: ActionCreator<void>;
  success: ActionCreator<TResult>;
  failure: ActionCreator<TError>;
}

/**
 * A reducer-like function that is handled by a specific action
 */
export type ActionReducer<TState, TPayload> = (
  state: TState,
  payload: TPayload
) => TState;

/**
 * A map-like structure where values are action-reducers
 */
export interface ActionReducerMap<TState> {
  [key: string]: ActionReducer<TState, any>;
}

/**
 * Optional configuration for action-creators
 */
export interface ActionCreatorOptions<TMeta> {
  meta?: TMeta;
  error?: boolean;
}

/**
 * An action-creator is a function capable of creating a type-safe Flux Standard Action (FSA)
 */
export interface ActionCreator<TPayload = void, TMeta = any> {
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
