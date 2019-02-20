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
export function createAsyncAction<TResult, TRun = undefined, TFailure = Error>(
  type: string,
  namespace?: string
) {
  const asyncAction = createAction<TRun>(type, namespace) as AsyncAction<
    TResult,
    TRun,
    TFailure
  >;

  asyncAction.request = createAction(`${type}_REQUEST`, namespace);
  asyncAction.success = createAction<TResult>(`${type}_SUCCESS`, namespace);
  asyncAction.failure = createAction<TFailure>(`${type}_FAILURE`, namespace);

  return asyncAction;
}

export type ActionCreatorFactory = (
  t: string,
  ns?: string
) => ActionCreator<any> | AsyncAction<any>;

type ActionCreatorMap<T extends { [k: string]: ActionCreatorFactory }> = {} & {
  [P in keyof T]: ReturnType<T[P]>
};

const createActionsAPI = {
  action: <TPayload>() => (type: string, namespace?: string) =>
    createAction<TPayload>(type, namespace),
  asyncAction: <TResult, TPayload = void, TError = Error>() => (
    type: string,
    namespace?: string
  ) => createAsyncAction<TResult, TPayload, TError>(type, namespace)
};

export function createActions<T extends { [k: string]: ActionCreatorFactory }>(
  ns: string,
  defsFn: (api: typeof createActionsAPI) => T
): ActionCreatorMap<T> {
  const api = {
    action<TPayload>() {
      return (type: string) => createAction<TPayload>(type, ns);
    },
    asyncAction<TResult, TPayload = void, TError = Error>() {
      return (type: string) =>
        createAsyncAction<TResult, TPayload, TError>(type, ns);
    }
  };

  const defs = defsFn(api);

  return Object.keys(defs).reduce(
    (acc: any /* hacky hack */, key) => {
      const f = defs[key];
      return { ...acc, [key]: f(key, ns) };
    },
    {} as ActionCreatorMap<T>
  );
}
