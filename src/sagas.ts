import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { Action, AsyncAction } from "./core";

export function apiWorkerFactory<TPayload, TResult>(
  asyncAction: AsyncAction<TPayload, TResult>,
  asyncHandler: (payload: TPayload) => Promise<TResult>
) {
  return function* sagaWorker(action: Action<TPayload>): SagaIterator {
    yield put(asyncAction.request());

    try {
      const result: TResult = yield call(asyncHandler, action.payload);
      yield put(asyncAction.success(result));
    } catch (e) {
      yield put(asyncAction.failure(e, { error: true }));
    }
  };
}
