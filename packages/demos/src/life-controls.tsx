/**
 * The Render Inspector's control bar. The run state is a single 3-way mode —
 * `idle | play | max` — so the buttons toggle one union instead of juggling two
 * mutually-exclusive booleans with hand-written cross-`disabled` guards.
 */
import type { Dispatch, SetStateAction } from "react";

/** Run loop: stopped, fixed-rate (`setInterval`), or max-rate (`rAF`). */
export type RunMode = "idle" | "play" | "max";
/** Which backend(s) the run loop drives. */
export type Active = "both" | "rr" | "ctx";

export function Controls({
  mode,
  setMode,
  active,
  setActive,
  speed,
  setSpeed,
  pulse,
  setPulse,
  onStep,
  onRandomize,
  onClear,
  onResetStats,
}: {
  mode: RunMode;
  setMode: Dispatch<SetStateAction<RunMode>>;
  active: Active;
  setActive: Dispatch<SetStateAction<Active>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  pulse: boolean;
  setPulse: Dispatch<SetStateAction<boolean>>;
  onStep: () => void;
  onRandomize: () => void;
  onClear: () => void;
  onResetStats: () => void;
}) {
  return (
    <>
      <div className="ri-controls">
        <span className="ri-group">
          <button
            type="button"
            className="ri-btn ri-primary"
            onClick={() => setMode((m) => (m === "play" ? "idle" : "play"))}
            disabled={mode === "max"}
          >
            {mode === "play" ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            type="button"
            className={mode === "max" ? "ri-btn ri-primary" : "ri-btn"}
            onClick={() => setMode((m) => (m === "max" ? "idle" : "max"))}
            disabled={mode === "play"}
          >
            {mode === "max" ? "⏹ Stop max" : "⚡ Max (rAF)"}
          </button>
          <button
            type="button"
            className="ri-btn"
            onClick={onStep}
            disabled={mode !== "idle"}
          >
            ⏭ Step
          </button>
        </span>

        <span className="ri-group">
          <button type="button" className="ri-btn" onClick={onRandomize}>
            🎲 Randomize
          </button>
          <button type="button" className="ri-btn" onClick={onClear}>
            ✕ Clear
          </button>
          <button type="button" className="ri-btn" onClick={onResetStats}>
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
    </>
  );
}
