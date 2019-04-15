import { testSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";

import { createAsyncAction } from "../lib/actions";
import { apiWorkerFactory } from "../lib/sagas";

describe("Sagas", () => {
  describe("apiWorkerFactory", () => {
    describe("creates a saga that's able to process simple api calls with built-in error handling", () => {
      it("should handle a successful flow", () => {
        const triggerAction = createAsyncAction<string[]>("FETCH_FOOS");
        const mockApiResponse = ["foo", "bar", "baz"];
        const mockApiCall = () => Promise.resolve(mockApiResponse);

        const saga = apiWorkerFactory(triggerAction, mockApiCall);

        testSaga(saga, triggerAction())
          .next()
          .put(triggerAction.request())
          .next()
          .call(mockApiCall)
          .next(mockApiResponse)
          .put(triggerAction.success(mockApiResponse))
          .next()
          .isDone();
      });

      it("should also handle a failure flow", () => {
        const triggerAction = createAsyncAction<string[]>("FETCH_FOOS");
        const mockError = new Error("something went wrong :(");
        const mockApiCall = () => Promise.reject(mockError);

        const saga = apiWorkerFactory(triggerAction, mockApiCall);

        testSaga(saga, triggerAction())
          .next()
          .put(triggerAction.request())
          .next()
          .call(mockApiCall)
          .throw(mockError)
          .put(triggerAction.failure(mockError))
          .next()
          .isDone();
      });

      it("should also handle a saga triggered by an action with a payload", () => {
        const triggerAction = createAsyncAction<string[], string>("FETCH_FOOS");
        const mockApiResponse = ["foo", "bar", "baz"];
        const mockApiCall = (id: string) => Promise.resolve(mockApiResponse);

        const saga = apiWorkerFactory<string[], string>(
          triggerAction,
          mockApiCall
        );

        testSaga(saga, triggerAction("foo"))
          .next()
          .put(triggerAction.request())
          .next()
          .call(mockApiCall, "foo")
          .next(mockApiResponse)
          .put(triggerAction.success(mockApiResponse))
          .next()
          .isDone();
      });

      it("should handle a saga with onSuccess hook", () => {
        const triggerAction = createAsyncAction<string[]>("FETCH_FOOS");
        const action = triggerAction();
        const mockApiResponse = ["foo", "bar", "baz"];

        function* onSuccess(result: string[]) {
          yield put(triggerAction.success(result));
        }

        const mockApiCall = () => Promise.resolve(mockApiResponse);

        const saga = apiWorkerFactory(triggerAction, mockApiCall, {
          onSuccess
        });

        testSaga(saga, action)
          .next()
          .put(triggerAction.request())
          .next()
          .call(mockApiCall)
          .next(mockApiResponse)
          .fork(onSuccess, mockApiResponse, action)
          .next()
          .isDone();
      });

      it("should handle a saga with onFailure hook", () => {
        const triggerAction = createAsyncAction<string[]>("FETCH_FOOS");
        const action = triggerAction();
        const mockError = new Error("something went wrong");

        function* onFailure(error: Error) {
          yield put(triggerAction.failure(error));
        }

        const mockApiCall = () => Promise.reject(mockError);

        const saga = apiWorkerFactory(triggerAction, mockApiCall, {
          onFailure
        });

        testSaga(saga, action)
          .next()
          .put(triggerAction.request())
          .next()
          .call(mockApiCall)
          .throw(mockError)
          .fork(onFailure, mockError, action)
          .next()
          .isDone();
      });
    });
  });
});
