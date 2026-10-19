import { describe, expect, it } from "bun:test";
import { createContainer, defineContainer } from "../src/container";
import { storageSet } from "../src/intents";
import { createTestStore } from "../src/testing";

// #85: a reaction that emits nothing must not add `void` to the intent union.
// The typecheck is the real assertion — these calls fail to compile if it does.
const expression = defineContainer("order", {
  state: { n: 0 },
  actions: (on) => ({ load: on(() => ({ n: 1 })) }),
  effects: (fx) => [
    fx.onMount(({ actions }) => actions.load()),
    fx.onAction("load", () => storageSet("loaded", true)),
  ],
});

const block = defineContainer("order", {
  state: { n: 0 },
  actions: (on) => ({ load: on(() => ({ n: 1 })) }),
  effects: (fx) => [
    fx.onMount(({ actions }) => {
      actions.load();
    }),
    fx.onChange(
      (s) => s.n,
      () => {},
    ),
    fx.onEnter(
      (s) => s.n.value > 0,
      ({ actions }) => actions.load(),
    ),
    fx.onAction("load", () => storageSet("loaded", true)),
  ],
});

describe("reactions that emit no intent", () => {
  it.each([
    ["expression body", expression],
    ["block body", block],
  ])("%s: createContainer and createTestStore accept it", (_, def) => {
    const store = createContainer(def, {
      interpreters: { storageSet: () => {} },
    });
    expect(store.get("n")).toBe(1);
    expect(createTestStore(def).get("n")).toBe(1);
  });
});
