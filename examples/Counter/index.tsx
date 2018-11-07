import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import Counter from "./Counter";
import reducer from "./reducers";

const store = createStore(reducer);

export default () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
