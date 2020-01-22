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
 * A composite Action to handle async workflows with nested actions for `request`, `success`, `failure` and `cancel`
 */
export interface AsyncActionCreator<TResult, TPayload = void, TError = Error>
  extends ActionCreator<TPayload> {
  /**
   * action to be dispatched before an async task
   */
  request: ActionCreator<void>;
  /**
   * action to be dispatched upon a successfull async task
   */
  success: ActionCreator<TResult>;
  /**
   * action to be dispatched upon a failed async task
   */
  failure: ActionCreator<TError>;
  /**
   * action to be dispatched to cancel an async task
   */
  cancel: ActionCreator<void>;
}

/**
 *  @deprecated temporary alias for AsyncActionCreator
 * this alias will be removed in v3.x
 */
export type AsyncAction<
  TResult,
  TPayload = void,
  TError = Error
> = AsyncActionCreator<TResult, TPayload, TError>;

/**
 * A reducer-like function that is handled by a specific action
 */
export type ActionReducer<TState, TPayload> = (
  state: TState,
  payload: TPayload
) => TState;

export type PartialActionReducer<TState, TPayload> = (
  state: TState
) => (payload: TPayload) => TState;

export type ActionFolder<TState, TPayload> = (
  payload: TPayload,
  state: TState
) => TState;

export type PartialActionFolder<TState, TPayload> = (
  payload: TPayload
) => (state: TState) => TState;

/**
 * A map-like structure where values are action-reducers
 */
export type ActionReducerMap<TState> = Record<
  string,
  ActionReducer<TState, any>
>;

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
  /**
   * action creator function
   */
  (payload: TPayload, options?: ActionCreatorOptions<TMeta>): Action<
    TPayload,
    TMeta
  >;
  /**
   * actions's string type
   */
  type: string;
  /**
   * handles an action with a classic `reducer` function that takes state and payload as arguments
   */
  reduce<TState>(
    handler: ActionReducer<TState, TPayload>
  ): Record<string, ActionReducer<TState, TPayload>>;
  /**
   * handles an action with a `partial reducer` function that takes state and payload as arguments
   */
  reduceP<TState>(
    handler: PartialActionReducer<TState, TPayload>
  ): Record<string, ActionReducer<TState, TPayload>>;
  /**
   * handles an action with a classic `folder` function that takes payload and state as arguments
   */
  fold<TState>(
    handler: ActionFolder<TState, TPayload>
  ): Record<string, ActionReducer<TState, TPayload>>;
  /**
   * handles an action with a `partial folder` function that takes payload and state as arguments
   */
  foldP<TState>(
    handler: PartialActionFolder<TState, TPayload>
  ): Record<string, ActionReducer<TState, TPayload>>;
}
