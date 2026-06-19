/**
 * The Render Inspector's metrics readout — the `<dl>` of per-backend counts plus
 * the explanatory notes on how to read them fairly.
 */
import type { Active } from "./life-controls";

/** One backend's live numbers for the readout. */
type Metrics = { renders: number; fps: number; ms: number; pop: number };

export function StatsPanel({
  rr,
  ctx,
  loopFps,
  active,
  popRecomputes,
  gen,
}: {
  rr: Metrics;
  ctx: Metrics;
  /** rAF loop frame rate, or null when the max-rate loop isn't running. */
  loopFps: number | null;
  active: Active;
  popRecomputes: number;
  gen: number;
}) {
  return (
    <>
      <dl className="ri-stats">
        <div className="ri-feat">
          <dt>
            cell re-renders{" "}
            <span className="ri-dim">(Context vs re-reduced)</span>
          </dt>
          <dd className="ri-mono">
            {rr.renders > 0 ? `${(ctx.renders / rr.renders).toFixed(1)}×` : "—"}
          </dd>
          <dt className="ri-dim">
            fewer with re-reduced ·{" "}
            <span className="ri-rr">{rr.renders.toLocaleString()}</span> vs{" "}
            <span className="ri-ctx">{ctx.renders.toLocaleString()}</span>
          </dt>
        </div>
        <div className="ri-wide">
          <dt>
            renders / sec <span className="ri-dim">(per backend)</span>
          </dt>
          <dd className="ri-mono">
            <span className="ri-rr">{rr.fps || "—"}</span> /{" "}
            <span className="ri-ctx">{ctx.fps || "—"}</span>
          </dd>
        </div>
        <div className="ri-wide">
          <dt>
            render time / tick <span className="ri-dim">(ms · rr / ctx)</span>
          </dt>
          <dd className="ri-mono">
            <span className="ri-rr">{rr.ms ? rr.ms.toFixed(2) : "—"}</span> /{" "}
            <span className="ri-ctx">{ctx.ms ? ctx.ms.toFixed(2) : "—"}</span>
          </dd>
        </div>
        <div>
          <dt>
            loop FPS <span className="ri-dim">(rAF, {active})</span>
          </dt>
          <dd className="ri-mono">{loopFps ?? "—"}</dd>
        </div>
        <div>
          <dt>
            population <span className="ri-dim">(rr / ctx)</span>
          </dt>
          <dd className="ri-mono">
            <span className="ri-rr">{rr.pop}</span> /{" "}
            <span className="ri-ctx">{ctx.pop}</span>
          </dd>
        </div>
        <div>
          <dt>
            <code>population</code> recomputes{" "}
            <span className="ri-dim">(rr, memoized)</span>
          </dt>
          <dd className="ri-mono">{popRecomputes}</dd>
        </div>
        <div>
          <dt>Generation</dt>
          <dd className="ri-mono">{gen}</dd>
        </div>
      </dl>

      {loopFps === null && rr.fps === 0 && ctx.fps === 0 && (
        <p className="ri-hint">
          Timing populates once it runs. For a clean per-backend FPS, switch to{" "}
          <strong>rr only</strong> / <strong>ctx only</strong> and hit{" "}
          <strong>⚡ Max (rAF)</strong> so the other board isn't sharing the
          frame.
        </p>
      )}

      <p className="ri-note">
        Both backends share the same board and controls — the <em>only</em>{" "}
        difference is how each subscribes. Watch the pulse: re-reduced lights up
        just the cells that flipped; Context strobes the whole grid every tick.
        The re-reduced tick is still O(cells) in JS (snapshot + diff — see the
        benchmarks), but it avoids the DOM commit that makes the Context board
        jank at speed.
      </p>
      <p className="ri-note">
        <strong>Reading the FPS fairly.</strong> <em>render ms / tick</em> is
        per-backend and stays clean even with both running — React renders each
        board's subtree sequentially and the <code>Profiler</code> times each on
        its own. <em>loop FPS</em> is the shared frame budget, so it reflects
        whatever is active: to read a backend's <em>true</em> sustained FPS,
        switch <em>Both → rr only / ctx only</em> so the other isn't contending.
        (Render timing needs React's dev/profiling build; a production bundle
        shows “—”.)
      </p>
    </>
  );
}
