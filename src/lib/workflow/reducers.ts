import { combineReducers, Reducer } from "redux";
import uniq from "ramda/src/uniq";
import always from "ramda/src/always";
import mergeLeft from "ramda/src/mergeLeft";
import indexBy from "ramda/src/indexBy";

import { AsyncAction, createReducer, foldP, fold, reduce } from "../..";

import { AsyncCollection, Result, RequestState, REQUEST_STATUS } from "./types";

export const REQUEST_INITIAL_STATE: RequestState<any> = {
  status: REQUEST_STATUS.Idle,
};

export function createRequestReducer<
  TResult = any,
  TPayload = void,
  TError = Error
>(
  action: AsyncAction<TResult, TPayload, TError>
): Reducer<RequestState<TError>> {
  const INITIAL_STATE: RequestState<TError> = REQUEST_INITIAL_STATE;

  return createReducer<RequestState<TError>>(
    [
      reduce(action.request, (state) => ({
        ...state,
        error: undefined,
        status: REQUEST_STATUS.Pending,
        lastRequested: Date.now(),
      })),
      reduce(action.success, (state) => ({
        ...state,
        error: undefined,
        status: REQUEST_STATUS.Fulfilled,
        lastExecuted: Date.now(),
      })),
      reduce(action.failure, (state, error) => ({
        ...state,
        error,
        status: REQUEST_STATUS.Failed,
      })),
      reduce(action.cancel, (state) => ({
        ...state,
        status: REQUEST_STATUS.Cancelled,
      })),
    ],
    INITIAL_STATE
  );
}

export const ASYNC_COLLECTION_INITIAL_STATE: AsyncCollection<any, any> = {
  byId: {},
  idList: [],
  request: REQUEST_INITIAL_STATE,
};

export function createAsyncCollectionReducer<
  TData,
  TPayload = void,
  TError = Error,
  TResult extends Result<TData[]> = Result<TData[]>
>(options: {
  action: AsyncAction<TResult, TPayload, TError>;
  idKey: keyof TData;
  initialState?: Partial<AsyncCollection<TData, TError>>;
  mergeStrategy?: "merge" | "overwrite"; // default = overwrite
}): Reducer<AsyncCollection<TData, TError>> {
  type TState = AsyncCollection<TData, TError>;

  const defaultState: TState = ASYNC_COLLECTION_INITIAL_STATE;

  const INITIAL_STATE: TState = options.initialState
    ? mergeLeft(defaultState, options.initialState)
    : defaultState;

  return combineReducers<AsyncCollection<TData, TError>>({
    byId: createReducer(
      foldP(options.action.success, (payload) => {
        const indexed = indexBy(
          (item) => String(item[options.idKey]),
          payload.items
        );
        return options.mergeStrategy === "merge"
          ? mergeLeft(indexed)
          : always(indexed);
      }),
      INITIAL_STATE.byId
    ),
    idList: createReducer(
      fold(options.action.success, (payload, state) => {
        const ids = payload.items.map((item) => String(item[options.idKey]));

        return options.mergeStrategy === "merge"
          ? uniq(state.concat(ids))
          : ids;
      }),
      INITIAL_STATE.idList
    ),
    request: createRequestReducer(options.action),
  });
}
