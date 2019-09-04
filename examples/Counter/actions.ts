import { createActions } from "../../src";

export default createActions("COUNTER", create => ({
  adjust: create.action<number>(),
  decrement: create.action(),
  increment: create.action(),
}));
