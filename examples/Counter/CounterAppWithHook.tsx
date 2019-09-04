import React, { useMemo } from "react";

import { useActions, useReduxState } from "../../src";

import unboundActions from "./actions";
import * as selectors from "./selectors";
import { colors } from "./constants";

import Button from "./Button";

const stateSelectorMap = {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive,
};

function useCounterStyle(isPositive: boolean, isOdd: boolean) {
  const color = useMemo(
    () => (isPositive ? (isOdd ? colors.odd : colors.even) : colors.negative),
    [isOdd, isPositive]
  );

  const counterStyle: React.CSSProperties = useMemo(
    () => ({
      color,
      fontWeight: "bold",
      paddingLeft: 5,
      paddingRight: 5,
      width: 50,
    }),
    [color]
  );

  return counterStyle;
}

export default function Counter() {
  const actions = useActions(unboundActions);
  const state = useReduxState(stateSelectorMap);
  const counterStyle = useCounterStyle(state.isPositive, state.isOdd);

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
