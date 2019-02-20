import { SagaIterator } from "redux-saga";
import {
  AllEffect,
  call,
  ForkEffect,
  put,
  PutEffect
} from "redux-saga/effects";

import { Action, AsyncAction } from "./core";

export type APIWorkerHookEffect<TPayload, TCombiner = any> =
  | PutEffect<Action<TPayload>>
  | AllEffect<TCombiner>
  | ForkEffect;

export interface APIWorkerHooks<TResult, TFailure> {
  onSuccess(result: TResult): APIWorkerHookEffect<TResult>;
  onFailure(error: TFailure): APIWorkerHookEffect<TFailure>;
}

export function apiWorkerFactory<
  TResult,
  TPayload = void,
  TFailure extends Error = Error
>(
  asyncAction: AsyncAction<TResult, TPayload>,
  asyncHandler: TPayload extends void
    ? (...args: any[]) => Promise<TResult>
    : (payload: TPayload) => Promise<TResult>,
  hooks?: Partial<APIWorkerHooks<TResult, TFailure>>
) {
  const $hooks = {
    onSuccess: (result: TResult) => put(asyncAction.success(result)),
    onFailure: (error: TFailure) => put(asyncAction.failure(error)),
    ...(hooks || {})
  };

  return function* sagaWorker(action: Action<TPayload>): SagaIterator {
    try {
      yield put(asyncAction.request());

      const result: TResult =
        typeof action.payload === "undefined"
          ? yield call<(...args: any[]) => any>(asyncHandler)
          : yield call<(...args: any[]) => any>(asyncHandler, action.payload);

      yield $hooks.onSuccess(result);
    } catch (error) {
      yield $hooks.onFailure(error);
    }
  };
}
