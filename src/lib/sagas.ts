import { SagaIterator } from "redux-saga";
import {
  call,
  fork,
  put,
  AllEffect,
  ForkEffect,
  PutEffect
} from "redux-saga/effects";

import { Action, AsyncAction } from "./core";

export type APIWorkerHookEffect<TPayload, TCombiner = any> =
  | PutEffect<Action<TPayload>>
  | AllEffect<TCombiner>
  | ForkEffect;

export interface APIWorkerHooks<TResult, TFailure> {
  onSuccess(result: TResult): IterableIterator<APIWorkerHookEffect<TResult>>;
  onFailure(error: TFailure): IterableIterator<APIWorkerHookEffect<TFailure>>;
}

export function apiWorkerFactory<
  TResult,
  TPayload = void,
  TFailure extends Error = Error
>(
  asyncAction: AsyncAction<TResult, TPayload>,
  asyncHandler: TPayload extends void | undefined
    ? () => Promise<TResult>
    : (payload: TPayload) => Promise<TResult>,
  hooks?: Partial<APIWorkerHooks<TResult, TFailure>>
) {
  return function* sagaWorker(action: Action<TPayload>): SagaIterator {
    try {
      yield put(asyncAction.request());

      const result: TResult =
        typeof action.payload === "undefined"
          ? yield call<(payload?: any) => Promise<TResult>>(asyncHandler)
          : yield call<(payload: TPayload) => Promise<TResult>>(
              asyncHandler,
              action.payload
            );

      if (hooks && hooks.onSuccess) {
        yield fork(hooks.onSuccess, result);
      } else {
        yield put(asyncAction.success(result));
      }
    } catch (error) {
      if (hooks && hooks.onFailure) {
        yield fork(hooks.onFailure, error);
      } else {
        yield put(asyncAction.failure(error));
      }
    }
  };
}
