import * as React from "react";
import styled from "@emotion/styled";

import appActions from "./actions";
import * as selectors from "./selectors";
import { useActions, useReduxState } from "../../src";

const Button = styled.button`
  padding: 5px 10px;
  font-size: 24px;
  transition: color 0.3s ease-in-out;
`;

const selectState = {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive
};

export default function Counter() {
  const actions = useActions(appActions);
  const state = useReduxState(selectState);

  return (
    <div>
      <Button
        style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
        onClick={() => actions.decrement()}
      >
        -1
      </Button>
      <Button onClick={() => actions.adjust(-5)}>-5</Button>
      <Button
        disabled
        style={{
          color: state.isPositive
            ? state.isOdd
              ? "#311E84"
              : "#FF5447"
            : "red",
          fontWeight: "bold",
          paddingLeft: 5,
          paddingRight: 5,
          width: 50
        }}
      >
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
