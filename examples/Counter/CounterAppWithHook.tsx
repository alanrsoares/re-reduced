import * as React from "react";

import { useActions, useReduxState } from "../../src";

import appActions from "./actions";
import * as selectors from "./selectors";
import Button from "./Button";
import { colors } from "./constants";

const selectState = {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive
};

export default function Counter() {
  const actions = useActions(appActions);
  const state = useReduxState(selectState);

  const counterStyle: React.CSSProperties = {
    color: state.isPositive
      ? state.isOdd
        ? colors.odd
        : colors.even
      : colors.negative,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingRight: 5,
    width: 50
  };

  return (
    <div>
      <Button
        style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
        onClick={() => actions.decrement()}
      >
        -1
      </Button>
      <Button onClick={() => actions.adjust(-5)}>-5</Button>
      <Button disabled style={counterStyle}>
        {state.count}
      </Button>
      <Button onClick={() => actions.adjust(5)}>+5</Button>
      <Button
        style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
        onClick={() => actions.increment()}
      >
        +1
      </Button>
    </div>
  );
}
