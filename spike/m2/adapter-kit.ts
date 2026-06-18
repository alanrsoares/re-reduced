/**
 * adapter-kit (spike) — the server bridge interpreter (ADR-0006).
 *
 * Lives at the adapter layer because that is where the data layer is. Bound to
 * a TanStack-style QueryClient (imperative `fetchQuery`, usable outside hooks),
 * so the same interpreter serves any renderer. Aborts on Store disposal.
 */
import type { InterpCtx } from "./container";
import type { QueryIntent } from "./intents";

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
			.fetchQuery({ queryKey: intent.key, queryFn: ({ signal: s }) => intent.run(s) })
			.then((data) => {
				if (!signal.aborted) intent.onData(data); // result re-enters as an action (SSOT)
			})
			.catch((error) => {
				if (!signal.aborted) intent.onError?.(error);
			});
	};
