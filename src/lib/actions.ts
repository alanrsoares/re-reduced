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

  const actionCreator = ((
    payload: TPayload,
    options?: ActionCreatorOptions<TMeta>
  ) => ({
    error: options ? options.error : undefined,
    meta: options ? options.meta : undefined,
    payload,
    type: $type,
  })) as ActionCreator<TPayload, TMeta>;

  actionCreator.type = $type;

  return Object.assign(actionCreator, {
    type: $type,
    reduce: <TState>(handler: ActionReducer<TState, TPayload>) => ({
      [actionCreator.type]: handler,
    }),
    reduceP: <TState>(handler: PartialActionReducer<TState, TPayload>) => ({
      [actionCreator.type]: uncurryN(2, handler),
    }),
    fold: <TState>(handler: ActionFolder<TState, TPayload>) => ({
      [actionCreator.type]: flip(handler),
    }),
    foldP: <TState>(handler: PartialActionFolder<TState, TPayload>) => ({
      [actionCreator.type]: flip(uncurryN(2, handler)),
    }),
  });
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
  const asyncAction: AsyncAction<TResult, TPayload, TFailure> = Object.assign(
    createAction<TPayload>(type, namespace),
    {
      request: createAction(`${type}_REQUEST`, namespace),
      success: createAction<TResult>(`${type}_SUCCESS`, namespace),
      failure: createAction<TFailure>(`${type}_FAILURE`, namespace),
    }
  );

  return asyncAction;
}

export type ActionCreatorMap<
  T extends Record<string, (type: string, namespace?: string) => any>
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
  T extends Record<string, (type: string, namespace?: string) => any>
>(actionsContructor: (api: typeof CreateActionsAPI) => T): ActionCreatorMap<T>;
export function createActions<
  T extends Record<string, (type: string, namespace?: string) => any>
>(
  namespace: string,
  actionsContructor: (api: typeof CreateActionsAPI) => T
): ActionCreatorMap<T>;
export function createActions() {
  const namespace: string | undefined =
    arguments.length === 1 ? undefined : arguments[0];
  const actionsContructor =
    arguments.length === 1 ? arguments[0] : arguments[1];
  const defs = actionsContructor(CreateActionsAPI);

  return Object.keys(defs).reduce((acc, key) => {
    const action = defs[key](key, namespace);

    return { ...acc, [key]: action };
  }, {});
}
