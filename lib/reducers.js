"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.reducerConfig = (config) => (Object.assign({}, config, { idKey: "id", initialState: undefined }));
exports.reducerConfigWithId = (config) => (Object.assign({}, config, { initialState: undefined }));
exports.reducerConfigWithState = (config) => (Object.assign({}, config, { idKey: "" }));
exports.handleActions = (handlers, initialState) => (state = initialState, action) => {
    const actionHandler = handlers[action.type];
    if (typeof actionHandler === "function") {
        return actionHandler(action.payload, state);
    }
    return state;
};
const combineFunctors = (functors) => (config, customHandlers = {}) => {
    const handlers = ramda_1.mergeAll(functors.map(ramda_1.applyTo(config)));
    return ramda_1.merge(handlers, customHandlers);
};
exports.createReducer = (functor, defaultInitialState) => {
    const finalFunctor = (Array.isArray(functor)
        ? combineFunctors(functor)
        : functor);
    const reducerFactory = (config, customHandlers = {}) => {
        // patch initialState to config if not present
        const initialState = typeof config.initialState === "undefined"
            ? defaultInitialState
            : config.initialState;
        const handlers = ramda_1.merge(finalFunctor(Object.assign({}, config, { initialState })), customHandlers);
        return exports.handleActions(handlers, initialState);
    };
    reducerFactory.functor = finalFunctor;
    return reducerFactory;
};
