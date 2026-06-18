import type { SagaIterator } from "redux-saga";
import {
  type AllEffect,
  type CallEffect,
  call,
  type ForkEffect,
  fork,
  type PutEffect,
  put,
  type SelectEffect,
} from "redux-saga/effects";

import type { Action, AsyncActionCreator } from "./core";

export type APIWorkerHookEffect<TPayload, TCombiner = unknown> =
  | PutEffect<Action<TPayload>>
  | AllEffect<TCombiner>
  | ForkEffect
  | CallEffect
  | SelectEffect;

export interface APIWorkerHooks<TResult, TFailure, TAction> {
  onSuccess(
    result: TResult,
    action: TAction,
  ): IterableIterator<APIWorkerHookEffect<TResult>>;
  onFailure(
    error: TFailure,
    action: TAction,
  ): IterableIterator<APIWorkerHookEffect<TFailure>>;
}

/**
 * Higher order saga for handling common remote resource fetching and error handling routines
 *
 * @param asyncAction
 * @param asyncHandler
 * @param hooks
 */
export function apiWorkerFactory<
  TResult,
  TPayload = void,
  TFailure extends Error = Error,
>(
  asyncAction: AsyncActionCreator<TResult, TPayload>,
  asyncHandler: TPayload extends void
    ? () => Promise<TResult>
    : (payload: TPayload) => Promise<TResult>,
  hooks?: Partial<APIWorkerHooks<TResult, TFailure, Action<TPayload>>>,
) {
  return function* sagaWorker(action: Action<TPayload>): SagaIterator {
    try {
      yield put(asyncAction.request());

      const result: TResult =
        typeof action.payload === "undefined"
          ? yield call<(payload?: any) => Promise<TResult>>(asyncHandler)
          : yield call<(payload: TPayload) => Promise<TResult>>(
              asyncHandler,
              action.payload,
            );

      if (hooks?.onSuccess) {
        yield fork(hooks.onSuccess, result, action);
      } else {
        yield put(asyncAction.success(result));
      }
    } catch (error) {
      const failure = error as TFailure;
      if (hooks?.onFailure) {
        yield fork(hooks.onFailure, failure, action);
      } else {
        yield put(asyncAction.failure(failure));
      }
    }
  };
}
