import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";

import reducer from "./reducers";
import rootSaga from "./sagas";
import App from "./ToDoApp";

function configureStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(reducer, applyMiddleware(sagaMiddleware));

  sagaMiddleware.run(rootSaga);

  return store;
}

const store = configureStore();

export default () => (
  <Provider store={store}>
    <App title="my todos" />
  </Provider>
);
