/**
 * Mutation intent + bridge interpreter. An adapter-level extension of the
 * intent vocabulary (the open registry, ADR-0006): the renderer app's intent
 * union becomes `BuiltinIntent | MutationIntent`.
 */
import type { InterpCtx } from "@re-reduced/core";

export interface MutationIntent {
  readonly kind: "mutate";
  readonly run: (signal: AbortSignal) => Promise<unknown>;
  readonly onSuccess?: (data: unknown) => void;
  readonly onError?: (error: unknown) => void;
  readonly invalidates?: readonly (readonly unknown[])[];
}

export const mutate = <T>(spec: {
  run: (signal: AbortSignal) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  invalidates?: readonly (readonly unknown[])[];
}): MutationIntent => ({
  kind: "mutate",
  run: spec.run as (signal: AbortSignal) => Promise<unknown>,
  onSuccess: spec.onSuccess as ((data: unknown) => void) | undefined,
  onError: spec.onError,
  invalidates: spec.invalidates,
});

export interface MutationClientLike {
  invalidateQueries(opts: { queryKey: readonly unknown[] }): void;
}

export const makeMutationInterpreter =
  <A>(client?: MutationClientLike) =>
  (intent: MutationIntent, { signal }: InterpCtx<A>): void => {
    intent
      .run(signal)
      .then((data) => {
        if (signal.aborted) return;
        intent.onSuccess?.(data);
        if (intent.invalidates && client) {
          for (const queryKey of intent.invalidates)
            client.invalidateQueries({ queryKey });
        }
      })
      .catch((error) => {
        if (!signal.aborted) intent.onError?.(error);
      });
  };
