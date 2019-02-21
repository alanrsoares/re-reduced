import { ActionCreator, ActionCreatorOptions, AsyncAction } from "./core";
import { toSnakeCase } from "./helpers/strings";

/**
 * returns an action-creator function
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export function createAction<TPayload = void, TMeta = any>(
  type: string,
  namespace?: string
) {
  const $type = toSnakeCase(namespace ? `${namespace}/${type}` : type);

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
    TResult,
    TPayload,
    TFailure
  >;

  asyncAction.request = createAction(`${type}_REQUEST`, namespace);
  asyncAction.success = createAction<TResult>(`${type}_SUCCESS`, namespace);
  asyncAction.failure = createAction<TFailure>(`${type}_FAILURE`, namespace);

  return asyncAction;
}

type ActionCreatorMap<
  T extends {
    [k: string]: (type: string, namespace?: string) => any;
  }
> = { [P in keyof T]: ReturnType<T[P]> };

export class CreateActionsAPI {
  public static action = <TPayload = void, TMeta = any>() => (
    type: string,
    namespace?: string
  ) => createAction<TPayload, TMeta>(type, namespace);

  public static asyncAction = <TResult, TPayload = void, TError = Error>() => (
    type: string,
    namespace?: string
  ) => createAsyncAction<TResult, TPayload, TError>(type, namespace);
}

/**
 * Creates an object with namespaced action-creators
 *
 * @param namespace - string - a namespace to be prepended to the generated action types
 * @param actionsContructor
 */
export function createActions<
  T extends {
    [k: string]: (type: string, namespace?: string) => any;
  }
>(
  namespace: string,
  actionsContructor: (api: typeof CreateActionsAPI) => T
): ActionCreatorMap<T> {
  const defs = actionsContructor(CreateActionsAPI);

  return Object.keys(defs).reduce(
    (acc: any /* hacky hack */, key) => ({
      ...acc,
      [key]: defs[key](key, namespace)
    }),
    {}
  );
}
