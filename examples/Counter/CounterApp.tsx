import * as React from "react";
import styled from "@emotion/styled";

import { connectWithActions } from "../../src";

import actions from "./actions";
import * as selectors from "./selectors";

const Button = styled.button`
  padding: 5px 10px;
  font-size: 24px;
`;

interface Props {
  count: number;
  isOdd: boolean;
  isPositive: boolean;
  actions: typeof actions;
}

const Counter = (props: Props) => (
  <div>
    <Button onClick={() => props.actions.decrement()}>-1</Button>
    <Button onClick={() => props.actions.adjust(-5)}>-5</Button>
    <Button
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
    </Button>
    <Button onClick={() => props.actions.adjust(5)}>+5</Button>
    <Button onClick={() => props.actions.increment()}>+1</Button>
  </div>
);

const enhance = connectWithActions<Props>(actions, {
  count: selectors.getCounter,
  isOdd: selectors.getCounterIsOdd,
  isPositive: selectors.getCounterIsPositive
});

export default enhance(Counter);
