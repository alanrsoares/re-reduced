"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createAction(type) {
    const actionCreator = ((payload) => ({
        payload,
        type
    }));
    actionCreator.type = type;
    return actionCreator;
}
exports.createAction = createAction;
function createAsyncActions(type, domain) {
    const fn = createAction(`${domain}/${type}`);
    fn.request = createAction(`${domain}/${type}_REQUEST`);
    fn.success = createAction(`${domain}/${type}_SUCCESS`);
    fn.failure = createAction(`${domain}/${type}_FAILURE`);
    return fn;
}
exports.createAsyncActions = createAsyncActions;
