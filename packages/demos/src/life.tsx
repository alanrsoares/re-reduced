import { useContainer, useSelect } from "@re-reduced/react";
import {
  createContext,
  memo,
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

const gridStyle = { gridTemplateColumns: `repeat(${COLS}, 1fr)` };

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
  badgeTestId,
  children,
}: {
  title: string;
  subtitle: string;
  renders: number;
  badgeTestId: string;
  children: ReactNode;
}) {
  return (
    <div className="ri-panel">
      <div className="ri-panel-head">
        <strong>{title}</strong>
        <span className="ri-badge" data-testid={badgeTestId}>
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
  const [speed, setSpeed] = useState(6);
  const [pulse, setPulse] = useState(true);

  const paint = useCallback(
    (i: number) => {
      rrStore.actions.setCell({ i, v: 1 });
      ctxDispatch({ type: "setCell", i, v: 1 });
    },
    [rrStore],
  );

  const step = useCallback(() => {
    rrStore.actions.tick();
    ctxDispatch({ type: "tick" });
    setGen((g) => g + 1);
  }, [rrStore]);

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
    force();
  }, []);

  // run loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(step, Math.max(33, Math.round(1000 / speed)));
    return () => clearInterval(id);
  }, [running, speed, step]);

  // seed a board on mount
  useEffect(() => {
    randomize();
  }, [randomize]);

  const rrPop = rrStore.$derived.population.peek();
  const ctxPop = population(ctxBoard);

  return (
    <div className="ri not-prose">
      <div className="ri-controls">
        <button
          type="button"
          className="ri-btn ri-primary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          type="button"
          className="ri-btn"
          onClick={step}
          disabled={running}
        >
          ⏭ Step
        </button>
        <button type="button" className="ri-btn" onClick={randomize}>
          🎲 Randomize
        </button>
        <button type="button" className="ri-btn" onClick={clear}>
          ✕ Clear
        </button>
        <button type="button" className="ri-btn" onClick={resetStats}>
          ↺ Reset counts
        </button>
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
      </div>

      <div className="ri-boards">
        <Panel
          title="re-reduced"
          subtitle="one signal per cell — only flipped cells re-render"
          renders={rrStats.current.renders}
          badgeTestId="rr-renders"
        >
          <RRBoard
            store={rrStore}
            stats={rrStats.current}
            onPaint={paint}
            pulse={pulse}
          />
        </Panel>

        <Panel
          title="useReducer + Context"
          subtitle="one state object — every cell re-renders each tick"
          renders={ctxStats.current.renders}
          badgeTestId="ctx-renders"
        >
          <LifeCtx.Provider value={ctxBoard}>
            <CtxBoard stats={ctxStats.current} onPaint={paint} pulse={pulse} />
          </LifeCtx.Provider>
        </Panel>
      </div>

      <dl className="ri-stats">
        <div>
          <dt>Generation</dt>
          <dd className="ri-mono">{gen}</dd>
        </div>
        <div>
          <dt>Population</dt>
          <dd className="ri-mono">
            {rrPop} / {ctxPop}
          </dd>
        </div>
        <div>
          <dt>
            re-render ratio <span className="ri-dim">(context ÷ rr)</span>
          </dt>
          <dd className="ri-mono">
            {rrStats.current.renders > 0
              ? `${(ctxStats.current.renders / rrStats.current.renders).toFixed(1)}×`
              : "—"}
          </dd>
        </div>
        <div>
          <dt>
            <code>population</code> recomputes{" "}
            <span className="ri-dim">(rr, memoized)</span>
          </dt>
          <dd className="ri-mono">{rrRc.current.count}</dd>
        </div>
      </dl>

      <p className="ri-note">
        Draw with the mouse on either grid. Both backends share the same board
        and controls — the <em>only</em> difference is how each subscribes.
        Watch the pulse: re-reduced lights up just the cells that flipped;
        Context strobes the whole grid every tick. The re-reduced tick is still
        O(cells) in JS (snapshot + diff — see the benchmarks), but it avoids the
        DOM commit that makes the Context board jank at speed.
      </p>
    </div>
  );
}
