"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effects_1 = require("redux-saga/effects");
function apiWorkerFactory(actions, asyncHandler) {
    return function* sagaWorker(action) {
        yield effects_1.put(actions.request());
        try {
            const result = yield effects_1.call(asyncHandler, action.payload);
            yield effects_1.put(actions.success(result));
        }
        catch (e) {
            yield effects_1.put(actions.failure(e));
        }
    };
}
exports.apiWorkerFactory = apiWorkerFactory;
