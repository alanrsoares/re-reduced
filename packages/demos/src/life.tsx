import { useContainer } from "@re-reduced/react";
import {
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { CtxBoard, LifeCtx, Panel, RRBoard } from "./life-boards";
import { type Active, Controls, type RunMode } from "./life-controls";
import { perTick, resetBackend, useBackend } from "./life-metrics";
import { StatsPanel } from "./life-stats";
import {
  defineLife,
  emptyBoard,
  type LifeStore,
  lifeReducer,
  population,
  type RecomputeCounter,
  randomBoard,
} from "./life-store";

/**
 * Render Inspector — Conway's Game of Life on a 30×30 grid of DOM nodes, run on
 * two backends at once from one set of controls. Watch the cell-re-render
 * counters and the render pulses: re-reduced updates only flipped cells; the
 * Context backend re-renders the whole grid every tick.
 *
 * This component is just orchestration — board stores, the run loop, and the
 * derived metrics. The control bar, the two boards, the metrics readout, and the
 * per-backend measurement plumbing each live in their own sibling module.
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

  const rr = useBackend();
  const ctx = useBackend();
  const [, force] = useReducer((n: number) => n + 1, 0);

  const [gen, setGen] = useState(0);
  const [mode, setMode] = useState<RunMode>("idle");
  const [speed, setSpeed] = useState(6);
  const [pulse, setPulse] = useState(true);
  // Isolate one backend to measure its true sustained FPS without the other
  // contending for the same frame budget.
  const [active, setActive] = useState<Active>("both");
  const runRR = active !== "ctx";
  const runCtx = active !== "rr";

  const fps = useRef({ frames: 0, since: 0, value: 0 });

  const paint = useCallback(
    (i: number) => {
      rrStore.actions.setCell({ i, v: 1 });
      ctxDispatch({ type: "setCell", i, v: 1 });
    },
    [rrStore],
  );

  // The single source of truth for a tick — shared by the fixed-rate loop, the
  // max-rate loop, and the Step button so they can't drift apart.
  const advance = useCallback(() => {
    if (runRR) rrStore.actions.tick();
    if (runCtx) ctxDispatch({ type: "tick" });
    setGen((g) => g + 1);
  }, [runRR, runCtx, rrStore]);

  const randomize = useCallback(() => {
    const board = randomBoard(0.3, Math.random);
    rrStore.actions.load(board);
    ctxDispatch({ type: "load", board });
    setGen(0);
  }, [rrStore]);

  const clear = useCallback(() => {
    setMode("idle");
    rrStore.actions.clear();
    ctxDispatch({ type: "clear" });
    setGen(0);
  }, [rrStore]);

  const resetStats = useCallback(() => {
    resetBackend(rr);
    resetBackend(ctx);
    rrRc.current.count = 0;
    fps.current = { frames: 0, since: 0, value: 0 };
    force();
  }, [rr, ctx]);

  // fixed-rate run loop (Play)
  useEffect(() => {
    if (mode !== "play") return;
    const id = setInterval(advance, Math.max(33, Math.round(1000 / speed)));
    return () => clearInterval(id);
  }, [mode, speed, advance]);

  // max-rate run loop (rAF) — ticks as fast as the frame budget allows
  useEffect(() => {
    if (mode !== "max") return;
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
      advance();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [mode, advance]);

  // measurements are only meaningful within one run mode — reset on change
  const maxMode = mode === "max";
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetStats is stable
  useEffect(() => {
    resetStats();
  }, [active, maxMode]);

  // seed a board on mount
  useEffect(() => {
    randomize();
  }, [randomize]);

  const rrPop = rrStore.$derived.population.peek();
  const ctxPop = population(ctxBoard);

  const rrMs = perTick(rr.prof.current, runRR);
  const ctxMs = perTick(ctx.prof.current, runCtx);
  const rrFps = rrMs ? Math.round(1000 / rrMs) : 0;
  const ctxFps = ctxMs ? Math.round(1000 / ctxMs) : 0;

  return (
    <div className="ri not-prose">
      <Controls
        mode={mode}
        setMode={setMode}
        active={active}
        setActive={setActive}
        speed={speed}
        setSpeed={setSpeed}
        pulse={pulse}
        setPulse={setPulse}
        onStep={advance}
        onRandomize={randomize}
        onClear={clear}
        onResetStats={resetStats}
      />

      <div className="ri-boards">
        <div className={runRR ? "ri-wrap" : "ri-wrap ri-idle"}>
          <Panel
            title="re-reduced"
            subtitle="one signal per cell — only flipped cells re-render"
            renders={rr.stats.current.renders}
            tone="good"
            badgeTestId="rr-renders"
          >
            <Profiler id="rr" onRender={rr.onRender}>
              <RRBoard
                store={rrStore}
                stats={rr.stats.current}
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
            renders={ctx.stats.current.renders}
            tone="bad"
            badgeTestId="ctx-renders"
          >
            <Profiler id="ctx" onRender={ctx.onRender}>
              <LifeCtx.Provider value={ctxBoard}>
                <CtxBoard
                  stats={ctx.stats.current}
                  onPaint={paint}
                  pulse={pulse}
                />
              </LifeCtx.Provider>
            </Profiler>
          </Panel>
        </div>
      </div>

      <StatsPanel
        rr={{
          renders: rr.stats.current.renders,
          fps: rrFps,
          ms: rrMs,
          pop: rrPop,
        }}
        ctx={{
          renders: ctx.stats.current.renders,
          fps: ctxFps,
          ms: ctxMs,
          pop: ctxPop,
        }}
        loopFps={maxMode ? Math.round(fps.current.value) : null}
        active={active}
        popRecomputes={rrRc.current.count}
        gen={gen}
      />
    </div>
  );
}
