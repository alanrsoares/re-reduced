import { useContainer, useSelect } from "@re-reduced/react";
import {
  createContext,
  memo,
  Profiler,
  type ProfilerOnRenderCallback,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  CELL_KEYS,
  COLS,
  cellKey,
  defineLife,
  emptyBoard,
  type LifeState,
  type LifeStore,
  lifeReducer,
  population,
  type RecomputeCounter,
  randomBoard,
} from "./life-store";

/** Per-board cumulative render tally — mutated in cell render bodies. */
type Stats = { renders: number };

const gridStyle = { gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` };

const LifeCtx = createContext<LifeState>(emptyBoard());

// ── presentational cell (shared by both backends) ──
function Cell({
  alive,
  i,
  onPaint,
  pulse,
  r,
}: {
  alive: boolean;
  i: number;
  onPaint: (i: number) => void;
  pulse: boolean;
  r: number;
}) {
  return (
    <div
      className={alive ? "ri-cell ri-on" : "ri-cell"}
      data-r={r}
      onPointerDown={(e) => {
        e.preventDefault();
        onPaint(i);
      }}
      onPointerEnter={(e) => {
        if (e.buttons === 1) onPaint(i);
      }}
    >
      {/* keyed remount replays the pulse animation on every render */}
      {pulse && <span className="ri-pulse" key={r} />}
    </div>
  );
}

// ── re-reduced cell: subscribes to ONE cell signal → re-renders only on flip ──
function RRCell({
  store,
  i,
  stats,
  onPaint,
  pulse,
}: {
  store: LifeStore;
  i: number;
  stats: Stats;
  onPaint: (i: number) => void;
  pulse: boolean;
}) {
  const v = useSelect(store, (s) => s[cellKey(i)].value);
  stats.renders += 1;
  const r = useRef(0);
  r.current += 1;
  return (
    <Cell alive={v === 1} i={i} onPaint={onPaint} pulse={pulse} r={r.current} />
  );
}

const RRBoard = memo(function RRBoard({
  store,
  stats,
  onPaint,
  pulse,
}: {
  store: LifeStore;
  stats: Stats;
  onPaint: (i: number) => void;
  pulse: boolean;
}) {
  return (
    <div className="ri-grid" style={gridStyle}>
      {CELL_KEYS.map((_, i) => (
        <RRCell
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are a fixed-length grid
          key={i}
          store={store}
          i={i}
          stats={stats}
          onPaint={onPaint}
          pulse={pulse}
        />
      ))}
    </div>
  );
});

// ── Context cell: reads the whole board → re-renders on ANY change (broadcast) ──
function CtxCell({
  i,
  stats,
  onPaint,
  pulse,
}: {
  i: number;
  stats: Stats;
  onPaint: (i: number) => void;
  pulse: boolean;
}) {
  const board = useContext(LifeCtx);
  stats.renders += 1;
  const r = useRef(0);
  r.current += 1;
  return (
    <Cell
      alive={board[cellKey(i)] === 1}
      i={i}
      onPaint={onPaint}
      pulse={pulse}
      r={r.current}
    />
  );
}

const CtxBoard = memo(function CtxBoard({
  stats,
  onPaint,
  pulse,
}: {
  stats: Stats;
  onPaint: (i: number) => void;
  pulse: boolean;
}) {
  return (
    <div className="ri-grid" style={gridStyle}>
      {CELL_KEYS.map((_, i) => (
        <CtxCell
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are a fixed-length grid
          key={i}
          i={i}
          stats={stats}
          onPaint={onPaint}
          pulse={pulse}
        />
      ))}
    </div>
  );
});

function Panel({
  title,
  subtitle,
  renders,
  tone,
  badgeTestId,
  children,
}: {
  title: string;
  subtitle: string;
  renders: number;
  tone: "good" | "bad";
  badgeTestId: string;
  children: ReactNode;
}) {
  return (
    <div className="ri-panel">
      <div className="ri-panel-head">
        <strong>{title}</strong>
        <span className={`ri-badge ri-${tone}`} data-testid={badgeTestId}>
          {renders.toLocaleString()} cell re-renders
        </span>
      </div>
      <p className="ri-sub">{subtitle}</p>
      {children}
    </div>
  );
}

/**
 * Render Inspector — Conway's Game of Life on a {ROWS}×{COLS} grid of DOM nodes,
 * run on two backends at once from one set of controls. Watch the cell-re-render
 * counters and the render pulses: re-reduced updates only flipped cells; the
 * Context backend re-renders the whole grid every tick.
 */
export function RenderInspector() {
  const rrRc = useRef<RecomputeCounter>({ count: 0 });
  const def = useMemo(() => defineLife(rrRc.current), []);
  const rrStore: LifeStore = useContainer(def);
  const [ctxBoard, ctxDispatch] = useReducer(
    lifeReducer,
    undefined,
    emptyBoard,
  );

  const rrStats = useRef<Stats>({ renders: 0 });
  const ctxStats = useRef<Stats>({ renders: 0 });
  const [, force] = useReducer((n: number) => n + 1, 0);

  const [gen, setGen] = useState(0);
  const [running, setRunning] = useState(false);
  const [raf, setRaf] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [pulse, setPulse] = useState(true);
  // Which backend(s) the run loop drives. Isolate one to measure its true
  // sustained FPS without the other contending for the same frame budget.
  const [active, setActive] = useState<"both" | "rr" | "ctx">("both");
  const runRR = active !== "ctx";
  const runCtx = active !== "rr";

  // Per-board render time, measured independently so the slow Context board
  // doesn't just gate one shared frame number. (React fires onRender only in
  // dev / profiling builds — production reads 0, shown as "—".)
  const rrProf = useRef({ ms: 0, commits: 0 });
  const ctxProf = useRef({ ms: 0, commits: 0 });
  const fps = useRef({ frames: 0, since: 0, value: 0 });

  const onRRRender = useCallback<ProfilerOnRenderCallback>(
    (_id, _p, actual) => {
      rrProf.current.ms += actual;
      rrProf.current.commits += 1;
    },
    [],
  );
  const onCtxRender = useCallback<ProfilerOnRenderCallback>(
    (_id, _p, actual) => {
      ctxProf.current.ms += actual;
      ctxProf.current.commits += 1;
    },
    [],
  );

  const paint = useCallback(
    (i: number) => {
      rrStore.actions.setCell({ i, v: 1 });
      ctxDispatch({ type: "setCell", i, v: 1 });
    },
    [rrStore],
  );

  const step = useCallback(() => {
    if (active !== "ctx") rrStore.actions.tick();
    if (active !== "rr") ctxDispatch({ type: "tick" });
    setGen((g) => g + 1);
  }, [rrStore, active]);

  const randomize = useCallback(() => {
    const board = randomBoard(0.3, Math.random);
    rrStore.actions.load(board);
    ctxDispatch({ type: "load", board });
    setGen(0);
  }, [rrStore]);

  const clear = useCallback(() => {
    setRunning(false);
    rrStore.actions.clear();
    ctxDispatch({ type: "clear" });
    setGen(0);
  }, [rrStore]);

  const resetStats = useCallback(() => {
    rrStats.current.renders = 0;
    ctxStats.current.renders = 0;
    rrRc.current.count = 0;
    rrProf.current = { ms: 0, commits: 0 };
    ctxProf.current = { ms: 0, commits: 0 };
    fps.current = { frames: 0, since: 0, value: 0 };
    force();
  }, []);

  // fixed-rate run loop (Play)
  useEffect(() => {
    if (!running || raf) return;
    const id = setInterval(step, Math.max(33, Math.round(1000 / speed)));
    return () => clearInterval(id);
  }, [running, raf, speed, step]);

  // max-rate run loop (rAF) — ticks as fast as the frame budget allows
  useEffect(() => {
    if (!raf) return;
    let id = 0;
    const loop = (t: number) => {
      const f = fps.current;
      if (f.since === 0) f.since = t;
      f.frames += 1;
      if (t - f.since >= 400) {
        f.value = (f.frames * 1000) / (t - f.since);
        f.frames = 0;
        f.since = t;
      }
      if (active !== "ctx") rrStore.actions.tick();
      if (active !== "rr") ctxDispatch({ type: "tick" });
      setGen((g) => g + 1);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [raf, rrStore, active]);

  // measurements are only meaningful within one run mode — reset on change
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetStats is stable
  useEffect(() => {
    resetStats();
  }, [active, raf]);

  // seed a board on mount
  useEffect(() => {
    randomize();
  }, [randomize]);

  const rrPop = rrStore.$derived.population.peek();
  const ctxPop = population(ctxBoard);

  // Only report a backend's timing while it's actually being driven — a paused
  // board's last (near-zero) commit would otherwise divide into a junk FPS.
  const rrMs =
    runRR && rrProf.current.commits
      ? rrProf.current.ms / rrProf.current.commits
      : 0;
  const ctxMs =
    runCtx && ctxProf.current.commits
      ? ctxProf.current.ms / ctxProf.current.commits
      : 0;
  const rrFps = rrMs ? Math.round(1000 / rrMs) : 0;
  const ctxFps = ctxMs ? Math.round(1000 / ctxMs) : 0;

  return (
    <div className="ri not-prose">
      <div className="ri-controls">
        <span className="ri-group">
          <button
            type="button"
            className="ri-btn ri-primary"
            onClick={() => setRunning((r) => !r)}
            disabled={raf}
          >
            {running ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            type="button"
            className={raf ? "ri-btn ri-primary" : "ri-btn"}
            onClick={() => setRaf((v) => !v)}
            disabled={running}
          >
            {raf ? "⏹ Stop max" : "⚡ Max (rAF)"}
          </button>
          <button
            type="button"
            className="ri-btn"
            onClick={step}
            disabled={running || raf}
          >
            ⏭ Step
          </button>
        </span>

        <span className="ri-group">
          <button type="button" className="ri-btn" onClick={randomize}>
            🎲 Randomize
          </button>
          <button type="button" className="ri-btn" onClick={clear}>
            ✕ Clear
          </button>
          <button type="button" className="ri-btn" onClick={resetStats}>
            ↺ Reset counts
          </button>
        </span>

        <span className="ri-seg">
          {(["both", "rr", "ctx"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={active === m ? "ri-btn ri-on-seg" : "ri-btn"}
              onClick={() => setActive(m)}
            >
              {m === "both" ? "Both" : m === "rr" ? "rr only" : "ctx only"}
            </button>
          ))}
        </span>

        <span className="ri-group">
          <label className="ri-field">
            Speed
            <input
              type="range"
              min={1}
              max={15}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="ri-mono">{speed}/s</span>
          </label>
          <label className="ri-field">
            <input
              type="checkbox"
              checked={pulse}
              onChange={(e) => setPulse(e.target.checked)}
            />
            Render pulse
          </label>
        </span>
      </div>
      <p className="ri-draw-hint">✎ Drag on either grid to draw cells.</p>

      <div className="ri-boards">
        <div className={runRR ? "ri-wrap" : "ri-wrap ri-idle"}>
          <Panel
            title="re-reduced"
            subtitle="one signal per cell — only flipped cells re-render"
            renders={rrStats.current.renders}
            tone="good"
            badgeTestId="rr-renders"
          >
            <Profiler id="rr" onRender={onRRRender}>
              <RRBoard
                store={rrStore}
                stats={rrStats.current}
                onPaint={paint}
                pulse={pulse}
              />
            </Profiler>
          </Panel>
        </div>

        <div className={runCtx ? "ri-wrap" : "ri-wrap ri-idle"}>
          <Panel
            title="useReducer + Context"
            subtitle="one state object — every cell re-renders each tick"
            renders={ctxStats.current.renders}
            tone="bad"
            badgeTestId="ctx-renders"
          >
            <Profiler id="ctx" onRender={onCtxRender}>
              <LifeCtx.Provider value={ctxBoard}>
                <CtxBoard
                  stats={ctxStats.current}
                  onPaint={paint}
                  pulse={pulse}
                />
              </LifeCtx.Provider>
            </Profiler>
          </Panel>
        </div>
      </div>

      <dl className="ri-stats">
        <div className="ri-feat">
          <dt>
            cell re-renders{" "}
            <span className="ri-dim">(Context vs re-reduced)</span>
          </dt>
          <dd className="ri-mono">
            {rrStats.current.renders > 0
              ? `${(ctxStats.current.renders / rrStats.current.renders).toFixed(1)}×`
              : "—"}
          </dd>
          <dt className="ri-dim">
            fewer with re-reduced ·{" "}
            <span className="ri-rr">
              {rrStats.current.renders.toLocaleString()}
            </span>{" "}
            vs{" "}
            <span className="ri-ctx">
              {ctxStats.current.renders.toLocaleString()}
            </span>
          </dt>
        </div>
        <div className="ri-wide">
          <dt>
            renders / sec <span className="ri-dim">(per backend)</span>
          </dt>
          <dd className="ri-mono">
            <span className="ri-rr">{rrFps || "—"}</span> /{" "}
            <span className="ri-ctx">{ctxFps || "—"}</span>
          </dd>
        </div>
        <div className="ri-wide">
          <dt>
            render time / tick <span className="ri-dim">(ms · rr / ctx)</span>
          </dt>
          <dd className="ri-mono">
            <span className="ri-rr">{rrMs ? rrMs.toFixed(2) : "—"}</span> /{" "}
            <span className="ri-ctx">{ctxMs ? ctxMs.toFixed(2) : "—"}</span>
          </dd>
        </div>
        <div>
          <dt>
            loop FPS <span className="ri-dim">(rAF, {active})</span>
          </dt>
          <dd className="ri-mono">
            {raf ? Math.round(fps.current.value) : "—"}
          </dd>
        </div>
        <div>
          <dt>
            population <span className="ri-dim">(rr / ctx)</span>
          </dt>
          <dd className="ri-mono">
            <span className="ri-rr">{rrPop}</span> /{" "}
            <span className="ri-ctx">{ctxPop}</span>
          </dd>
        </div>
        <div>
          <dt>
            <code>population</code> recomputes{" "}
            <span className="ri-dim">(rr, memoized)</span>
          </dt>
          <dd className="ri-mono">{rrRc.current.count}</dd>
        </div>
        <div>
          <dt>Generation</dt>
          <dd className="ri-mono">{gen}</dd>
        </div>
      </dl>

      {!raf && rrFps === 0 && ctxFps === 0 && (
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
    </div>
  );
}
