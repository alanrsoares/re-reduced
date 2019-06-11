import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import App from "./CounterApp";
import AppWithHook from "./CounterAppWithHook";
import reducer from "./reducers";

const store = createStore(reducer);

export default () => (
  <Provider store={store}>
    {/* use redux connect HOC */}
    <span>Using connectWithActions HOC:</span>
    <App />

    <br />

    {/* use hook */}
    <span>Using hooks:</span>
    <AppWithHook />
    <AppWithHook useStateFn />
  </Provider>
);
