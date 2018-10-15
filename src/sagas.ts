import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { Action, AsyncActions } from "./core";

export function apiWorkerFactory<TPayload, TResult>(
  actions: AsyncActions<TPayload, TResult>,
  asyncHandler: (payload: TPayload) => Promise<TResult>
) {
  return function* sagaWorker(action: Action<TPayload>): SagaIterator {
    yield put(actions.request());

    try {
      const result: TResult = yield call(asyncHandler, action.payload);
      yield put(actions.success(result));
    } catch (e) {
      yield put(actions.failure(e));
    }
  };
}
