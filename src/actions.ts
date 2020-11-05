import { flip, uncurryN } from "ramda";

import { toUpperSnakeCase } from "./helpers/strings";
import {
  ActionCreator,
  ActionCreatorOptions,
  AsyncActionCreator,
  ActionReducer,
  ActionFolder,
  PartialActionFolder,
  PartialActionReducer,
} from "./core";

/**
 * returns an action-creator function
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export function createAction<TPayload = void, TMeta = any>(
  type: string,
  namespace?: string
): ActionCreator<TPayload, TMeta> {
  const $type = toUpperSnakeCase(namespace ? `${namespace}/${type}` : type);

  const baseActionCreator = (
    payload: TPayload,
    options?: ActionCreatorOptions<TMeta>
  ) => ({
    error: options ? options.error : undefined,
    meta: options ? options.meta : undefined,
    payload,
    type: $type,
  });

  const extensions = {
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
  };

  return Object.assign(baseActionCreator, extensions) as ActionCreator<
    TPayload,
    TMeta
  >;
}

/**
 * Returns a composite action-creator with nested action-creators for request, success and failure
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export function createAsyncAction<TResult, TPayload = void, TFailure = Error>(
  type: string,
  namespace?: string
): AsyncActionCreator<TResult, TPayload, TFailure> {
  const baseAction = createAction<TPayload>(type, namespace);
  const extensions = {
    request: createAction(`${type}_REQUEST`, namespace),
    success: createAction<TResult>(`${type}_SUCCESS`, namespace),
    failure: createAction<TFailure>(`${type}_FAILURE`, namespace),
    cancel: createAction(`${type}_CANCEL`, namespace),
  };

  return Object.assign(baseAction, extensions) as AsyncActionCreator<
    TResult,
    TPayload,
    TFailure
  >;
}

export type ActionCreatorFactory = (type: string, namespace?: string) => any;

export type BaseActionCreatorMap = Record<string, ActionCreatorFactory>;

export type ActionCreatorMap<T extends BaseActionCreatorMap> = {
  [P in keyof T]: ReturnType<T[P]>;
};

export class CreateActionsAPI {
  public static action = <TPayload = void, TMeta = any>() => (
    type: string,
    namespace?: string
  ): ActionCreator<TPayload, TMeta> =>
    createAction<TPayload, TMeta>(type, namespace);

  public static asyncAction = <TResult, TPayload = void, TError = Error>() => (
    type: string,
    namespace?: string
  ): AsyncActionCreator<TResult, TPayload, TError> =>
    createAsyncAction<TResult, TPayload, TError>(type, namespace);
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
): ActionCreatorMap<T> {
  const namespace = args.length === 1 ? undefined : args[0];
  const actionsContructor = args.length === 1 ? args[0] : args[1];
  const defs = actionsContructor(CreateActionsAPI);

  return Object.entries(defs).reduce(
    (actionCreatorMap, [key, factory]) => ({
      ...actionCreatorMap,
      [key]: factory(key, namespace),
    }),
    {} as ActionCreatorMap<T>
  );
}
