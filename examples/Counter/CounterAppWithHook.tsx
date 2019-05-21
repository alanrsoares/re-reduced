import * as React from "react";

import { useActions, useReduxState } from "../../src";

import actions from "./actions";
import * as selectors from "./selectors";
import { colors } from "./constants";

import Button from "./Button";

const stateSelector = {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive,
};

export default function Counter() {
  const { decrement, increment, adjust } = useActions(actions);
  const { count, isOdd, isPositive } = useReduxState(stateSelector);

  const counterStyle: React.CSSProperties = {
    color: isPositive ? (isOdd ? colors.odd : colors.even) : colors.negative,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingRight: 5,
    width: 50,
  };

  return (
    <div>
      <Button
        style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
        onClick={() => decrement()}
      >
        -1
      </Button>
      <Button onClick={() => adjust(-5)}>-5</Button>
      <Button disabled style={counterStyle}>
        {count}
      </Button>
      <Button onClick={() => adjust(5)}>+5</Button>
      <Button
        style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
        onClick={() => increment()}
      >
        +1
      </Button>
    </div>
  );
}
