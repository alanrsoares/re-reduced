import * as React from "react";
import styled from "@emotion/styled";

import { connectWithActions } from "../../src";

import actions from "./actions";
import * as selectors from "./selectors";

const Button = styled.button`
  padding: 5px 10px;
  font-size: 24px;
  transition: color 0.3s ease-in-out;
`;

interface Props {
  count: number;
  isOdd: boolean;
  isPositive: boolean;
  actions: typeof actions;
}

const Counter = (props: Props) => (
  <div>
    <Button
      style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
      onClick={() => props.actions.decrement()}
    >
      -1
    </Button>
    <Button onClick={() => props.actions.adjust(-5)}>-5</Button>
    <Button
      disabled
      style={{
        color: props.isPositive ? (props.isOdd ? "#311E84" : "#FF5447") : "red",
        fontWeight: "bold",
        paddingLeft: 5,
        paddingRight: 5,
        width: 50
      }}
    >
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

const enhance = connectWithActions<Props>(actions, {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive
});

export default enhance(Counter);
