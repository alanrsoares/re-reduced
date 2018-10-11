"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
exports.reducerConfig = function (config) { return (__assign({}, config, { idKey: "id", initialState: undefined })); };
exports.reducerConfigWithId = function (config) { return (__assign({}, config, { initialState: undefined })); };
exports.reducerConfigWithState = function (config) { return (__assign({}, config, { idKey: "" })); };
exports.handleActions = function (actionHandlers, initialState) { return function (state, action) {
    if (state === void 0) { state = initialState; }
    var actionHandler = actionHandlers[action.type];
    if (typeof actionHandler === "function") {
        return actionHandler(action.payload, state);
    }
    return state;
}; };
var combineFunctors = function (functors) { return function (config, customHandlers) {
    if (customHandlers === void 0) { customHandlers = {}; }
    var handlers = ramda_1.mergeAll(functors.map(ramda_1.applyTo(config)));
    return ramda_1.merge(handlers, customHandlers);
}; };
exports.createReducer = function (functor, defaultInitialState) {
    var finalFunctor = (Array.isArray(functor)
        ? combineFunctors(functor)
        : functor);
    var reducerFactory = (function (config, customHandlers) {
        if (customHandlers === void 0) { customHandlers = {}; }
        // patch initialState to config if not present
        var initialState = typeof config.initialState === "undefined"
            ? defaultInitialState
            : config.initialState;
        var actionHandlers = ramda_1.merge(finalFunctor(__assign({}, config, { initialState: initialState })), customHandlers);
        return exports.handleActions(actionHandlers, initialState);
    });
    reducerFactory.functor = finalFunctor;
    return reducerFactory;
};
