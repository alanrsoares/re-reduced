import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import App from "./CounterApp";
import reducer from "./reducers";

const store = createStore(reducer);

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
