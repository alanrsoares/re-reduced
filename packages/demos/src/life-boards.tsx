/**
 * The two boards the Render Inspector contrasts, plus their shared cell. Both
 * render an identical {@link Cell} grid — the *only* difference is how each cell
 * subscribes: re-reduced reads one per-cell signal, Context reads the whole
 * board. That contrast is the demo's whole point, so the two stay deliberately
 * parallel; the render-counting plumbing they share lives in `./life-metrics`.
 */
import { useSelect } from "@re-reduced/react";
import { createContext, memo, type ReactNode, useContext } from "react";
import { type Tally, useRenderTally } from "./life-metrics";
import {
  CELL_KEYS,
  COLS,
  cellKey,
  emptyBoard,
  type LifeState,
  type LifeStore,
} from "./life-store";

const gridStyle = { gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` };

export const LifeCtx = createContext<LifeState>(emptyBoard());

type CellProps = {
  alive: boolean;
  i: number;
  onPaint: (i: number) => void;
  pulse: boolean;
  r: number;
};

// ── presentational cell (shared by both backends) ──
function Cell({ alive, i, onPaint, pulse, r }: CellProps) {
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

type BoardProps = {
  stats: Tally;
  onPaint: (i: number) => void;
  pulse: boolean;
};

// ── re-reduced cell: subscribes to ONE cell signal → re-renders only on flip ──
function RRCell({
  store,
  i,
  stats,
  onPaint,
  pulse,
}: BoardProps & { store: LifeStore; i: number }) {
  const v = useSelect(store, (s) => s[cellKey(i)].value);
  const r = useRenderTally(stats);
  return <Cell alive={v === 1} i={i} onPaint={onPaint} pulse={pulse} r={r} />;
}

export const RRBoard = memo(function RRBoard({
  store,
  stats,
  onPaint,
  pulse,
}: BoardProps & { store: LifeStore }) {
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
function CtxCell({ i, stats, onPaint, pulse }: BoardProps & { i: number }) {
  const board = useContext(LifeCtx);
  const r = useRenderTally(stats);
  return (
    <Cell
      alive={board[cellKey(i)] === 1}
      i={i}
      onPaint={onPaint}
      pulse={pulse}
      r={r}
    />
  );
}

export const CtxBoard = memo(function CtxBoard({
  stats,
  onPaint,
  pulse,
}: BoardProps) {
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

export function Panel({
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
