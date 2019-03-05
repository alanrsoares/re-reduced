"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.reducerConfig = (config) => (Object.assign({}, config, { idKey: "id", initialState: undefined }));
exports.reducerConfigWithId = (config) => (Object.assign({}, config, { initialState: undefined }));
exports.reducerConfigWithState = (config) => (Object.assign({}, config, { idKey: "" }));
function createReducer(handlers, initialState) {
    const $handlers = Array.isArray(handlers)
        ? ramda_1.mergeAll(handlers)
        : handlers;
    return (state = initialState, action) => {
        const actionReducer = $handlers[action.type];
        if (typeof actionReducer === "function") {
            return actionReducer(state, action.payload);
        }
        return state;
    };
}
exports.createReducer = createReducer;
// temporary alias for createReducer
exports.handleActions = createReducer;
/**
 * registers a reducer handler for one or many actions
 *
 * @param action
 * @param reducer
 */
function match(actions, reducer) {
    if (Array.isArray(actions)) {
        return actions.reduce((acc, action) => (Object.assign({}, acc, action.reduce(reducer))), {});
    }
    else {
        return actions.reduce(reducer);
    }
}
exports.match = match;
const combineFunctors = (functors) => (config, customHandlers = {}) => {
    const handlers = ramda_1.mergeAll(functors.map(ramda_1.applyTo(config)));
    return ramda_1.merge(handlers, customHandlers);
};
exports.createReducerFactory = (functor, defaultInitialState) => {
    const finalFunctor = (Array.isArray(functor)
        ? combineFunctors(functor)
        : functor);
    const reducerFactory = (config, customHandlers = {}) => {
        // patch initialState to config if not present
        const initialState = typeof config.initialState === "undefined"
            ? defaultInitialState
            : config.initialState;
        const handlers = ramda_1.merge(finalFunctor(Object.assign({}, config, { initialState })), customHandlers);
        return createReducer(handlers, initialState);
    };
    reducerFactory.functor = finalFunctor;
    return reducerFactory;
};
