import { testSaga } from "redux-saga-test-plan";
import { createAsyncAction } from "../actions";
import { apiWorkerFactory } from "../sagas";

describe("Sagas", () => {
  describe("apiWorkerFactory", () => {
    it("should create a saga that's able to process simple api calls with built-in error handling", () => {
      const triggerAction = createAsyncAction<void, string[]>("FETCH_FOOS");
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
  });
});
