"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_1 = require("./helpers/strings");
/**
 * returns an action-creator function
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
function createAction(type, namespace) {
    const $type = strings_1.toSnakeCase(namespace ? `${namespace}/${type}` : type);
    const actionCreator = ((payload, options) => ({
        error: options ? options.error : undefined,
        meta: options ? options.meta : undefined,
        payload,
        type: $type
    }));
    actionCreator.type = $type;
    actionCreator.reduce = (handler) => ({
        [actionCreator.type]: handler
    });
    return actionCreator;
}
exports.createAction = createAction;
/**
 * return a composite action-creator with nested action-creators for request, success and failure
 *
 * @param type - the action identifier, must be unique
 * @param namespace - optional namespace string to be prepended to the type
 */
function createAsyncAction(type, namespace) {
    const asyncAction = createAction(type, namespace);
    asyncAction.request = createAction(`${type}_REQUEST`, namespace);
    asyncAction.success = createAction(`${type}_SUCCESS`, namespace);
    asyncAction.failure = createAction(`${type}_FAILURE`, namespace);
    return asyncAction;
}
exports.createAsyncAction = createAsyncAction;
class CreateActionsAPI {
}
CreateActionsAPI.action = () => (type, namespace) => createAction(type, namespace);
CreateActionsAPI.asyncAction = () => (type, namespace) => createAsyncAction(type, namespace);
exports.CreateActionsAPI = CreateActionsAPI;
/**
 * Creates an object with namespaced action-creators
 *
 * @param namespace - string - a namespace to be prepended to the generated action types
 * @param actionsContructor
 */
function createActions(namespace, actionsContructor) {
    const defs = actionsContructor(CreateActionsAPI);
    return Object.keys(defs).reduce((acc /* hacky hack */, key) => (Object.assign({}, acc, { [key]: defs[key](key, namespace) })), {});
}
exports.createActions = createActions;
