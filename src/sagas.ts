import { SagaIterator } from "redux-saga";
import {
  AllEffect,
  call,
  ForkEffect,
  put,
  PutEffect
} from "redux-saga/effects";

import { Action, AsyncAction } from "./core";

export type APIWorkerHookEffect<TPayload> =
  | PutEffect<Action<TPayload>>
  | AllEffect
  | ForkEffect;

export interface APIWorkerHooks<TResult, TFailure> {
  onFailure(error: TFailure): APIWorkerHookEffect<TFailure>;
  onSuccess(result: TResult): APIWorkerHookEffect<TResult>;
}

export function apiWorkerFactory<TPayload, TResult, TFailure = Error>(
  asyncAction: AsyncAction<TPayload, TResult>,
  asyncHandler: (payload: TPayload) => Promise<TResult>,
  hooks?: Partial<APIWorkerHooks<TResult, TFailure>>
) {
  const $hooks = {
    onFailure: (error: TFailure) => put(asyncAction.failure(error)),
    onSuccess: (result: TResult) => put(asyncAction.success(result)),
    ...(hooks || {})
  };

  return function* sagaWorker(action: Action<TPayload>): SagaIterator {
    try {
      yield put(asyncAction.request());
      const result: TResult = yield call(asyncHandler, action.payload);
      yield $hooks.onSuccess(result);
    } catch (error) {
      yield $hooks.onFailure(error);
    }
  };
}
