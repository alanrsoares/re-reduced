import { describe, expect, it } from "bun:test";
import type { InterpCtx } from "../src/container";
import { storageRemove, storageSet } from "../src/intents";
import {
  makeStorageInterpreter,
  makeStorageRemoveInterpreter,
  readStored,
  type StorageBackend,
} from "../src/interpreters";

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

const memory = (): StorageBackend & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    setItem: (k, v) => void data.set(k, v),
    getItem: (k) => data.get(k) ?? null,
    removeItem: (k) => void data.delete(k),
  };
};

describe("makeStorageRemoveInterpreter", () => {
  it("removes the key", () => {
    const b = memory();
    b.data.set("k", "1");
    makeStorageRemoveInterpreter(b)(storageRemove("k"), ctx);
    expect(b.data.has("k")).toBe(false);
  });

  it("does not throw when the backend throws or has no removeItem", () => {
    const throwing = {
      setItem() {},
      removeItem() {
        throw new Error("blocked");
      },
    };
    expect(() =>
      makeStorageRemoveInterpreter(throwing)(storageRemove("k"), ctx),
    ).not.toThrow();
    expect(() =>
      makeStorageRemoveInterpreter({ setItem() {} })(storageRemove("k"), ctx),
    ).not.toThrow();
  });
});

describe("readStored", () => {
  it("round-trips a value written by the storage interpreter", () => {
    const b = memory();
    makeStorageInterpreter(b)(storageSet("k", { a: 1 }), ctx);
    expect(readStored<unknown>("k", undefined, b)).toEqual({ a: 1 });
  });

  it("returns undefined for a missing key, bad JSON, or no backend", () => {
    const b = memory();
    b.data.set("bad", "{nope");
    expect(readStored("missing", undefined, b)).toBeUndefined();
    expect(readStored("bad", undefined, b)).toBeUndefined();
    expect(readStored("k", undefined, { setItem() {} })).toBeUndefined();
  });

  it("returns undefined when parse rejects, and when parse throws", () => {
    const b = memory();
    b.data.set("n", "1");
    const isString = (v: unknown) => (typeof v === "string" ? v : undefined);
    expect(readStored("n", isString, b)).toBeUndefined();
    expect(
      readStored(
        "n",
        () => {
          throw new Error("x");
        },
        b,
      ),
    ).toBeUndefined();
  });

  it("keeps the legacy numeric 1/0 form readable", () => {
    const b = memory();
    makeStorageInterpreter(b)(storageSet("flag", 1), ctx);
    expect(b.data.get("flag")).toBe("1");
    expect(readStored<unknown>("flag", undefined, b)).toBe(1);
  });
});

describe("blocked default storage", () => {
  it("does not throw when reading globalThis.localStorage throws", () => {
    const g = globalThis as { localStorage?: unknown };
    const desc = Object.getOwnPropertyDescriptor(g, "localStorage");
    Object.defineProperty(g, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(() =>
        makeStorageInterpreter()(storageSet("k", 1), ctx),
      ).not.toThrow();
      expect(() =>
        makeStorageRemoveInterpreter()(storageRemove("k"), ctx),
      ).not.toThrow();
      expect(readStored("k")).toBeUndefined();
    } finally {
      if (desc) Object.defineProperty(g, "localStorage", desc);
      else delete g.localStorage;
    }
  });
});
