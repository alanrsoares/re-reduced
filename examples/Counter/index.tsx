import React from "react";
import { Provider, createStore } from "../../src";

import App from "./CounterApp";
import reducer from "./reducers";

const store = createStore(reducer);

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
