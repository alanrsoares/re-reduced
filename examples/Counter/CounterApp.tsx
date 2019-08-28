import * as React from "react";
import { connectWithActions } from "../../src";

import actions from "./actions";
import * as selectors from "./selectors";
import { colors } from "./constants";

import Button from "./Button";

interface Props {
  count: number;
  isOdd: boolean;
  isPositive: boolean;
  actions: typeof actions;
}

function Counter(props: Props) {
  const counterStyle: React.CSSProperties = {
    color: props.isPositive
      ? props.isOdd
        ? colors.odd
        : colors.even
      : colors.negative,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingRight: 5,
    width: 50,
  };

  return (
    <div>
      <Button
        style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
        onClick={() => props.actions.decrement()}
      >
        -1
      </Button>
      <Button onClick={() => props.actions.adjust(-5)}>-5</Button>
      <Button disabled style={counterStyle}>
        {props.count}
      </Button>
      <Button onClick={() => props.actions.adjust(5)}>+5</Button>
      <Button
        style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
        onClick={() => props.actions.increment()}
      >
        +1
      </Button>
    </div>
  );
}

const enhance = connectWithActions<Props>(actions, {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive,
});

export default enhance(Counter);
