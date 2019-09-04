import uncurryN from "ramda/src/uncurryN";
import flip from "ramda/src/flip";

import {
  ActionCreator,
  ActionCreatorOptions,
  AsyncAction,
  ActionReducer,
  ActionFolder,
  PartialActionFolder,
  PartialActionReducer,
  Action,
} from "./core";
import { toSnakeCase } from "../helpers/strings";

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

  return Object.assign(
    (payload: TPayload, options?: ActionCreatorOptions<TMeta>) => ({
      error: options ? options.error : undefined,
      meta: options ? options.meta : undefined,
      payload,
      type: $type,
    }),
    {
      type: $type,
      reduce: <TState>(handler: ActionReducer<TState, TPayload>) => ({
        [$type]: handler,
      }),
      reduceP: <TState>(handler: PartialActionReducer<TState, TPayload>) => ({
        [$type]: uncurryN(2, handler),
      }),
      fold: <TState>(handler: ActionFolder<TState, TPayload>) => ({
        [$type]: flip(handler),
      }),
      foldP: <TState>(handler: PartialActionFolder<TState, TPayload>) => ({
        [$type]: flip(uncurryN(2, handler)),
      }),
    }
  ) as ActionCreator<TPayload, TMeta>;
}

/**
 * returns a composite action-creator with nested action-creators for request, success and failure
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export function createAsyncAction<TResult, TPayload = void, TFailure = Error>(
  type: string,
  namespace?: string
) {
  return Object.assign(createAction<TPayload>(type, namespace), {
    request: createAction(`${type}_REQUEST`, namespace),
    success: createAction<TResult>(`${type}_SUCCESS`, namespace),
    failure: createAction<TFailure>(`${type}_FAILURE`, namespace),
    cancel: createAction(`${type}_CANCEL`, namespace),
  }) as AsyncAction<TResult, TPayload, TFailure>;
}

export type BaseActionCreatorMap = Record<
  string,
  (type: string, namespace?: string) => Action<any> | AsyncAction<any, any>
>;

export type ActionCreatorMap<T extends BaseActionCreatorMap> = {
  [P in keyof T]: ReturnType<T[P]>;
};

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

export type ActionsConstructor<T> = (api: typeof CreateActionsAPI) => T;

/**
 * Creates an object with namespaced action-creators
 *
 * @param namespace - string - a namespace to be prepended to the generated action types
 * @param actionsContructor
 */
export function createActions<T extends BaseActionCreatorMap>(
  actionsContructor: ActionsConstructor<T>
): ActionCreatorMap<T>;
export function createActions<T extends BaseActionCreatorMap>(
  namespace: string,
  actionsContructor: ActionsConstructor<T>
): ActionCreatorMap<T>;
export function createActions<T extends BaseActionCreatorMap>(
  ...args: [ActionsConstructor<T>] | [string, ActionsConstructor<T>]
) {
  const namespace = args.length === 1 ? undefined : args[0];
  const actionsContructor = args.length === 1 ? args[0] : args[1];
  const defs = actionsContructor(CreateActionsAPI);

  return Object.keys(defs).reduce((acc, key) => {
    const action = defs[key](key, namespace);

    return { ...acc, [key]: action };
  }, {});
}
