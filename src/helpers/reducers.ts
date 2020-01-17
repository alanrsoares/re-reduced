import { dissoc } from "ramda";

export const set = <T extends {}, P extends keyof T>(
  prop: P,
  value: T[P],
  state: T
): T => ({
  ...state,
  [prop]: value,
});

export const setP = <T, P extends keyof T>(prop: P) => (value: T[P]) => (
  state: T
) => set(prop, value, state);

export const unset = <T extends {}, P extends keyof T>(prop: P, state: T): T =>
  dissoc(prop as string, state);

export const unsetP = <T, P extends keyof T>(prop: P) => (state: T) =>
  unset(prop, state);
