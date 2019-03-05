import { AllEffect, ForkEffect, PutEffect } from "redux-saga/effects";
import { Action, AsyncAction } from "./core";
export declare type APIWorkerHookEffect<TPayload, TCombiner = any> = PutEffect<Action<TPayload>> | AllEffect<TCombiner> | ForkEffect;
export interface APIWorkerHooks<TResult, TFailure> {
    onSuccess(result: TResult): APIWorkerHookEffect<TResult>;
    onFailure(error: TFailure): APIWorkerHookEffect<TFailure>;
}
export declare function apiWorkerFactory<TResult, TPayload = void, TFailure extends Error = Error>(asyncAction: AsyncAction<TResult, TPayload>, asyncHandler: TPayload extends void | undefined ? () => Promise<TResult> : (payload: TPayload) => Promise<TResult>, hooks?: Partial<APIWorkerHooks<TResult, TFailure>>): (action: Action<TPayload, any>) => IterableIterator<import("@redux-saga/types").StrictEffect<any>>;
