import { describe, expect, it } from "bun:test";
import { createContainer, defineContainer } from "../src/container";
import { storageSet, timeout } from "../src/intents";
import { createTestStore } from "../src/testing";

const def = defineContainer("counter", {
  state: { count: 0, label: "" },
  actions: (on) => ({
    inc: on((s) => ({ count: s.count + 1 })),
    set: on<string>((_s, label) => ({ label })),
  }),
  effects: (fx) => [
    fx.onMount(() => storageSet("mounted", true)),
    fx.onAction("inc", () => timeout(10, () => {})),
  ],
});

describe("store.get", () => {
  it("reads one field and tracks commits", () => {
    const store = createTestStore(def);
    expect(store.get("count")).toBe(0);
    store.actions.inc();
    expect(store.get("count")).toBe(1);
  });
});

describe("store.onAction", () => {
  it("reports committed actions with payload, then stops after unsubscribe", () => {
    const store = createTestStore(def);
    const seen: Array<[string, unknown, number]> = [];
    const off = store.onAction((name, payload) =>
      seen.push([name, payload, store.get("count")]),
    );
    store.actions.inc();
    store.actions.set("x");
    off();
    store.actions.inc();
    expect(seen).toEqual([
      ["inc", undefined, 1],
      ["set", "x", 1],
    ]);
  });

  it("clears listeners on destroy", () => {
    const store = createTestStore(def);
    let calls = 0;
    store.onAction(() => {
      calls += 1;
    });
    store.destroy();
    store.actions.inc();
    expect(calls).toBe(0);
  });
});

describe("fx.onMount", () => {
  it("fires once at creation and not again", () => {
    const store = createTestStore(def);
    expect(store.intents.map((i) => i.kind)).toEqual(["storageSet"]);
    store.actions.set("x");
    expect(store.intents.map((i) => i.kind)).toEqual(["storageSet"]);
  });
});

describe("createTestStore", () => {
  it("records every intent kind without interpreters", () => {
    const store = createTestStore(def);
    store.actions.inc();
    expect(store.intents.map((i) => i.kind)).toEqual(["storageSet", "timeout"]);
    store.clearIntents();
    expect(store.intents).toEqual([]);
  });

  it("runs a real interpreter for a chosen kind and still records it", () => {
    const written: string[] = [];
    const store = createTestStore(def, {
      interpreters: { storageSet: (i) => void written.push(i.key) },
    });
    expect(written).toEqual(["mounted"]);
    expect(store.intents).toHaveLength(1);
  });

  it("is still strict in createContainer", () => {
    expect(() => createContainer(def, { interpreters: {} as never })).toThrow(
      'no interpreter for intent kind "storageSet"',
    );
  });
});

describe("fx.onMount ordering", () => {
  it("a mount action reaches an onAction declared later", () => {
    const d = defineContainer("order", {
      state: { n: 0 },
      actions: (on) => ({ load: on(() => ({ n: 1 })) }),
      effects: (fx) => [
        fx.onMount(({ actions }) => actions.load()),
        fx.onAction("load", () => storageSet("loaded", true)),
      ],
    });
    const store = createTestStore(d);
    expect(store.intents.map((i) => i.kind)).toEqual(["storageSet"]);
  });
});

describe("void reactions", () => {
  it("emit no intents, so no interpreter is required", () => {
    const d = defineContainer("void", {
      state: { n: 0 },
      actions: (on) => ({
        inc: on((s) => ({ n: s.n + 1 })),
        reset: on(() => ({ n: 0 })),
      }),
      effects: (fx) => [
        fx.onMount(({ actions }) => actions.inc()),
        fx.onEnter(
          (s) => s.n.value >= 2,
          ({ actions }) => actions.reset(),
        ),
      ],
    });
    const store = createContainer(d);
    expect(store.get("n")).toBe(1);
    store.actions.inc();
    expect(store.get("n")).toBe(0);
  });
});
