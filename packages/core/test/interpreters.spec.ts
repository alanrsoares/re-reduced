import { describe, expect, it } from "bun:test";
import type { InterpCtx } from "../src/container";
import { storageSet } from "../src/intents";
import { makeStorageInterpreter } from "../src/interpreters";

const ctx = {
  actions: {},
  signal: new AbortController().signal,
} as InterpCtx<unknown>;

describe("makeStorageInterpreter", () => {
  it("writes the JSON-serialized value", () => {
    const written: Array<[string, string]> = [];
    const run = makeStorageInterpreter({
      setItem: (k, v) => void written.push([k, v]),
    });
    run(storageSet("k", { a: 1 }), ctx);
    expect(written).toEqual([["k", '{"a":1}']]);
  });

  it("does not throw when the backend throws", () => {
    const run = makeStorageInterpreter({
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => run(storageSet("k", 1), ctx)).not.toThrow();
  });

  it("does not throw on an unserializable value", () => {
    const run = makeStorageInterpreter({ setItem: () => {} });
    expect(() => run(storageSet("k", 1n), ctx)).not.toThrow();
  });
});
