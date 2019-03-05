import { ActionCreator, AsyncAction } from "./core";
/**
 * returns an action-creator function
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export declare function createAction<TPayload = void, TMeta = any>(type: string, namespace?: string): ActionCreator<TPayload, TMeta>;
/**
 * return a composite action-creator with nested action-creators for request, success and failure
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
export declare function createAsyncAction<TResult, TPayload = void, TFailure = Error>(type: string, namespace?: string): AsyncAction<TResult, TPayload, TFailure>;
declare type ActionCreatorMap<T extends {
    [k: string]: (type: string, namespace?: string) => any;
}> = {
    [P in keyof T]: ReturnType<T[P]>;
};
export declare class CreateActionsAPI {
    static action: <TPayload = void, TMeta = any>() => (type: string, namespace?: string | undefined) => ActionCreator<TPayload, TMeta>;
    static asyncAction: <TResult, TPayload = void, TError = Error>() => (type: string, namespace?: string | undefined) => AsyncAction<TResult, TPayload, TError>;
}
/**
 * Creates an object with namespaced action-creators
 *
 * @param namespace - string - a namespace to be prepended to the generated action types
 * @param actionsContructor
 */
export declare function createActions<T extends {
    [k: string]: (type: string, namespace?: string) => any;
}>(namespace: string, actionsContructor: (api: typeof CreateActionsAPI) => T): ActionCreatorMap<T>;
export {};
