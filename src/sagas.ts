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
  | AllEffect<any>
  | ForkEffect;

export interface APIWorkerHooks<TResult, TFailure> {
  onSuccess(result: TResult): APIWorkerHookEffect<TResult>;
  onFailure(error: TFailure): APIWorkerHookEffect<TFailure>;
}

export function apiWorkerFactory<
  TPayload,
  TResult,
  TFailure extends Error = Error
>(
  asyncAction: AsyncAction<TPayload, TResult>,
  asyncHandler: (payload: TPayload) => Promise<TResult>,
  hooks?: Partial<APIWorkerHooks<TResult, TFailure>>
) {
  const $hooks = {
    onSuccess: (result: TResult) => put(asyncAction.success(result)),
    onFailure: (error: TFailure) =>
      put(asyncAction.failure(error, { error: true })),
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
