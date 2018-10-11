"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createAction(type) {
    var actionCreator = (function (payload) { return ({
        payload: payload,
        type: type
    }); });
    actionCreator.type = type;
    return actionCreator;
}
exports.createAction = createAction;
function createAsyncActions(type, domain) {
    var fn = createAction(domain + "/" + type);
    fn.request = createAction(domain + "/" + type + "_REQUEST");
    fn.success = createAction(domain + "/" + type + "_SUCCESS");
    fn.failure = createAction(domain + "/" + type + "_FAILURE");
    return fn;
}
exports.createAsyncActions = createAsyncActions;
