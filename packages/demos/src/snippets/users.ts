// An effects example as a real, type-checked module: actions stay pure while
// side-effects are declared as `query` intents that the adapter interprets, so
// the rendered snippet can never drift from a container that actually builds.

// #region snippet
import { defineContainer, query } from "@re-reduced/core";
import type { User } from "./fixtures";

// ---cut-start---
const api = { list: (): Promise<User[]> => Promise.resolve([]) };
// ---cut-end---
export const users = defineContainer("users", {
  state: {
    items: [] as User[],
    status: "idle" as "idle" | "loading" | "ready",
  },
  actions: (on) => ({
    load: on((s) => ({ ...s, status: "loading" as const })),
    loaded: on<User[]>((s, items) => ({
      ...s,
      items,
      status: "ready" as const,
    })),
  }),
  // side-effects are declared as intents, interpreted by the adapter
  effects: (fx) => [
    fx.onAction("load", (_p, { actions }) =>
      query<User[]>({
        key: ["users"],
        run: () => api.list(),
        onData: (items) => actions.loaded(items),
      }),
    ),
  ],
});
// #endregion
