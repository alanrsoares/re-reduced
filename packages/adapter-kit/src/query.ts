/**
 * Query bridge interpreter (ADR-0006) — shared across renderer adapters.
 *
 * Bound to a TanStack-style QueryClient (imperative `fetchQuery`, usable
 * outside hooks), so the same interpreter serves React, Preact, etc. The query
 * INTENT shape lives in @re-reduced/core (shared vocabulary); the INTERPRETER
 * lives here because this is the data-layer seam. Aborts on Store disposal.
 */
import type { InterpCtx, QueryIntent } from "@re-reduced/core";

export interface QueryClientLike {
	fetchQuery(opts: {
		queryKey: readonly unknown[];
		queryFn: (ctx: { signal: AbortSignal }) => Promise<unknown>;
	}): Promise<unknown>;
}

export const makeQueryInterpreter =
	<A>(client: QueryClientLike) =>
	(intent: QueryIntent, { signal }: InterpCtx<A>): void => {
		client
			.fetchQuery({
				queryKey: intent.key,
				queryFn: ({ signal: s }) => intent.run(s),
			})
			.then((data) => {
				if (!signal.aborted) intent.onData(data); // result re-enters as an action (SSOT)
			})
			.catch((error) => {
				if (!signal.aborted) intent.onError?.(error);
			});
	};
