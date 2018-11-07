import * as React from "react";
import { connectWithActions } from "../../src";

import actions from "./actions";
import * as selectors from "./selectors";

interface Props {
  count: number;
  isOdd: boolean;
  isPositive: boolean;
  actions: typeof actions;
}

const Counter = (props: Props) => (
  <div>
    <button onClick={() => props.actions.decrement()}>-1</button>
    <button onClick={() => props.actions.adjust(-5)}>-5</button>
    <button
      disabled
      style={{
        color: props.isPositive ? (props.isOdd ? "blue" : "green") : "red",
        fontWeight: "bold",
        paddingLeft: 5,
        paddingRight: 5,
        width: 50
      }}
    >
      {props.count}
    </button>
    <button onClick={() => props.actions.adjust(5)}>+5</button>
    <button onClick={() => props.actions.increment()}>+1</button>
  </div>
);

const enhance = connectWithActions<Props>(actions, {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive
});

export default enhance(Counter);
