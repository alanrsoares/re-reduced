import React, { Fragment } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import App from "./CounterApp";
import AppWithHook from "./CounterAppWithHook";
import reducer from "./reducers";
import { StoreProvider } from "../../src";

const store = createStore(reducer);

export default () => (
  <Fragment>
    <span>Using connectWithActions HOC:</span>
    {/* use redux connect HOC */}
    <Provider store={store}>
      <App />
    </Provider>

    <span>Using hooks:</span>
    {/* use redux-react-hook */}
    <StoreProvider value={store}>
      <AppWithHook />
    </StoreProvider>
  </Fragment>
);
