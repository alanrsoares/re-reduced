import { ActionCreator, ActionCreatorOptions, AsyncAction } from "./core";

/**
 * returns an action-creator function
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export function createAction<TPayload, TMeta = any>(
  type: string,
  namespace?: string
) {
  const $type = namespace ? `${namespace}/${type}` : type;

  const actionCreator = ((
    payload: TPayload,
    options?: ActionCreatorOptions<TMeta>
  ) => ({
    error: options ? options.error : undefined,
    meta: options ? options.meta : undefined,
    payload,
    type: $type
  })) as ActionCreator<TPayload, TMeta>;

  actionCreator.type = $type;
  actionCreator.reduce = <TState>(
    handler: (state: TState, payload: TPayload) => TState
  ) => ({
    [actionCreator.type]: handler
  });

  return actionCreator;
}

/**
 * return a composite action-creator with nested action-creators for request, success and failure
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export function createAsyncAction<TResult, TPayload = void, TFailure = Error>(
  type: string,
  namespace?: string
) {
  const asyncAction = createAction<TPayload>(type, namespace) as AsyncAction<
    TPayload,
    TResult,
    TFailure
  >;

  asyncAction.request = createAction(`${type}_REQUEST`, namespace);
  asyncAction.success = createAction<TResult>(`${type}_SUCCESS`, namespace);
  asyncAction.failure = createAction<TFailure>(`${type}_FAILURE`, namespace);

  return asyncAction;
}
