"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effects_1 = require("redux-saga/effects");
function apiWorkerFactory(asyncAction, asyncHandler, hooks) {
    const $hooks = Object.assign({ onSuccess: (result) => effects_1.put(asyncAction.success(result)), onFailure: (error) => effects_1.put(asyncAction.failure(error)) }, (hooks || {}));
    return function* sagaWorker(action) {
        try {
            yield effects_1.put(asyncAction.request());
            const result = typeof action.payload === "undefined"
                ? yield effects_1.call(asyncHandler)
                : yield effects_1.call(asyncHandler, action.payload);
            yield $hooks.onSuccess(result);
        }
        catch (error) {
            yield $hooks.onFailure(error);
        }
    };
}
exports.apiWorkerFactory = apiWorkerFactory;
