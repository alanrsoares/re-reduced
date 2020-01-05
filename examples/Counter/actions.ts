import { createActions } from "../../src";

const NAMESPACE = "COUNTER";

export default createActions(NAMESPACE, create => ({
  adjust: create.action<number>(),
  decrement: create.action(),
  increment: create.action(),
}));
