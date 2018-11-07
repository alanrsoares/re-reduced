import * as React from "react";
import { connectWithActions } from "../../src";

import actions from "./actions";

interface Props {
  count: number;
  actions: typeof actions;
}

const Counter = (props: Props) => (
  <div>
    <div>Count: {props.count}</div>
    <div>
      <button onClick={() => props.actions.decrement()}>(-)</button>
      <button onClick={() => props.actions.increment()}>(+)</button>
      <button onClick={() => props.actions.adjust(5)}>(+5)</button>
      <button onClick={() => props.actions.adjust(-5)}>(-5)</button>
    </div>
  </div>
);

const enhance = connectWithActions<Props>(actions, {
  count: state => state
});

export default enhance(Counter);
