/**
 * Per-backend measurement plumbing for the Render Inspector. Both backends
 * (re-reduced and useReducer+Context) track the same two things — a cumulative
 * cell-render tally and accumulated React Profiler timing — so the bookkeeping
 * lives here once instead of being duplicated per backend in the view.
 */
import {
  type ProfilerOnRenderCallback,
  useCallback,
  useMemo,
  useRef,
} from "react";

/** Per-board cumulative render tally — mutated in cell render bodies. */
export type Tally = { renders: number };
/** Accumulated React Profiler timing for one board. */
export type Prof = { ms: number; commits: number };

export type Backend = {
  stats: { current: Tally };
  prof: { current: Prof };
  onRender: ProfilerOnRenderCallback;
};

/**
 * One backend's render tally + Profiler accumulator + commit callback. Returns a
 * stable object so it can sit in `useCallback`/`useEffect` dependency lists.
 */
export function useBackend(): Backend {
  const stats = useRef<Tally>({ renders: 0 });
  const prof = useRef<Prof>({ ms: 0, commits: 0 });
  const onRender = useCallback<ProfilerOnRenderCallback>(
    (_id, _phase, actual) => {
      prof.current.ms += actual;
      prof.current.commits += 1;
    },
    [],
  );
  return useMemo(() => ({ stats, prof, onRender }), [onRender]);
}

/** Zero a backend's accumulators (between run modes / on demand). */
export function resetBackend(b: Backend): void {
  b.stats.current.renders = 0;
  b.prof.current = { ms: 0, commits: 0 };
}

/**
 * Mean render time per commit — 0 while the board is idle or never committed, so
 * a paused board's stale last commit can't divide into a junk FPS.
 */
export const perTick = (prof: Prof, running: boolean): number =>
  running && prof.commits ? prof.ms / prof.commits : 0;

/**
 * Count this cell's own renders: bump the shared tally and a per-cell ref.
 * Returns the per-cell render number (written to `data-r`, which the test sums).
 */
export function useRenderTally(stats: Tally): number {
  stats.renders += 1;
  const r = useRef(0);
  r.current += 1;
  return r.current;
}
