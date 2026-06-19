import data from "@/lib/bench-results.json";

/**
 * Benchmark visualisations + tables, both rendered from lib/bench-results.json —
 * the file `bench/src/capture.ts` writes from a real `measure()` run. Nothing on
 * the benchmarks page is hand-typed, so a number can't drift from the harness.
 *
 * Series colors are fixed brand hues (coral = re-reduced, indigo = the other),
 * legible on both themes; axes/text use fumadocs theme vars.
 */

const RR = "#ef5c4c";
const ALT = "#6366f1";
const BASE = "#9ca3af";
const AXIS = "var(--color-fd-border)";
const TEXT = "var(--color-fd-muted-foreground)";

const fmt = (ns: number) => (ns >= 1000 ? `${(ns / 1000).toFixed(2)} µs` : `${ns} ns`);

// ── provenance ──
export function BenchProvenance() {
  const p = data.provenance;
  return (
    <div className="my-4 rounded-lg border border-fd-border bg-fd-card px-4 py-3 text-sm text-fd-muted-foreground">
      Captured on <strong className="text-fd-foreground">{p.cpu}</strong> ({p.cores}{" "}
      cores) · {p.runtime} · {p.os} · {p.date}
      <br />
      <span className="text-xs">
        re-reduced {p.versions["@re-reduced/core"]} · zustand {p.versions.zustand} ·
        mitata {p.versions.mitata} · regenerate with{" "}
        <code>bun run --filter @re-reduced/bench capture</code>
      </span>
    </div>
  );
}

// ── throughput: horizontal bars ──
export function BenchThroughput() {
  const rows = data.throughput;
  const max = Math.max(...rows.map((r) => r.ns));
  const baseline = rows.find((r) => r.label === "plain reducer")?.ns ?? 1;
  const W = 360;
  const labelW = 96;
  const barW = W - labelW - 64;
  const rowH = 34;
  return (
    <figure className="my-6">
      <svg
        viewBox={`0 0 ${W} ${rows.length * rowH + 8}`}
        className="w-full"
        role="img"
        aria-label="Dispatch throughput, nanoseconds per operation"
      >
        {rows.map((r, i) => {
          const y = i * rowH + 6;
          const w = Math.max(2, (r.ns / max) * barW);
          const isRR = r.label === "re-reduced";
          return (
            <g key={r.label}>
              <text x={labelW - 8} y={y + 13} textAnchor="end" fontSize="12" fill={TEXT}>
                {r.label}
              </text>
              <rect
                x={labelW}
                y={y}
                width={w}
                height={18}
                rx={3}
                fill={isRR ? RR : r.label === "zustand" ? ALT : BASE}
              />
              <text x={labelW + w + 6} y={y + 13} fontSize="11" fill={TEXT}>
                {fmt(r.ns)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs text-fd-muted-foreground">
        Dispatch + read in a tight loop (no React). re-reduced is ~
        {Math.round((rows.find((r) => r.label === "re-reduced")?.ns ?? 0) / baseline)}× a
        bare function call — the price of the signal write + shallow diff.
      </figcaption>
    </figure>
  );
}

// ── scaling: grouped bars, re-reduced vs zustand across field counts ──
export function BenchScaling() {
  const rows = data.scaling;
  const max = Math.max(...rows.flatMap((r) => [r.reReduced, r.zustand]));
  const W = 360;
  const H = 150;
  const padB = 28;
  const padT = 8;
  const gw = W / rows.length;
  const bw = gw * 0.3;
  const h = (v: number) => ((H - padB - padT) * v) / max;
  return (
    <figure className="my-6">
      <Legend items={[["re-reduced", RR], ["zustand", ALT]]} />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Dispatch time vs field count"
      >
        <line x1={0} y1={H - padB} x2={W} y2={H - padB} stroke={AXIS} />
        {rows.map((r, i) => {
          const cx = i * gw + gw / 2;
          const rrH = h(r.reReduced);
          const zsH = h(r.zustand);
          return (
            <g key={r.fields}>
              <rect x={cx - bw - 1} y={H - padB - rrH} width={bw} height={rrH} rx={2} fill={RR} />
              <rect x={cx + 1} y={H - padB - zsH} width={bw} height={zsH} rx={2} fill={ALT} />
              <text x={cx} y={H - padB + 14} textAnchor="middle" fontSize="11" fill={TEXT}>
                {r.fields}
              </text>
            </g>
          );
        })}
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="10" fill={TEXT}>
          fields
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-fd-muted-foreground">
        Bumping one field in an N-field container. re-reduced writes only the
        changed key, so it stays flat; zustand allocates a merged state object per{" "}
        <code>set</code>, so it grows with field count.
      </figcaption>
      <NumberTable
        head={["Fields", "re-reduced", "zustand"]}
        rows={rows.map((r) => [String(r.fields), fmt(r.reReduced), fmt(r.zustand)])}
      />
    </figure>
  );
}

// ── derivation crossover: log–log lines ──
export function BenchDerive() {
  const rows = data.derive;
  const W = 360;
  const H = 170;
  const padB = 28;
  const padT = 8;
  const padL = 8;
  const lo = 5;
  const hi = Math.max(...rows.flatMap((r) => [r.memoized, r.recompute])) * 1.2;
  const x = (i: number) => padL + (i / (rows.length - 1)) * (W - padL - 8);
  const logY = (v: number) =>
    H - padB - ((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (H - padB - padT);
  const line = (key: "memoized" | "recompute") =>
    rows.map((r, i) => `${x(i)},${logY(r[key])}`).join(" ");
  return (
    <figure className="my-6">
      <Legend items={[["recompute each read", ALT], ["memoized (cached)", RR]]} />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Derivation read cost vs work size (log scale)"
      >
        <line x1={padL} y1={H - padB} x2={W - 8} y2={H - padB} stroke={AXIS} />
        <polyline points={line("recompute")} fill="none" stroke={ALT} strokeWidth={2} />
        <polyline points={line("memoized")} fill="none" stroke={RR} strokeWidth={2} />
        {rows.map((r, i) => (
          <g key={r.work}>
            <circle cx={x(i)} cy={logY(r.recompute)} r={2.5} fill={ALT} />
            <circle cx={x(i)} cy={logY(r.memoized)} r={2.5} fill={RR} />
            <text x={x(i)} y={H - padB + 14} textAnchor="middle" fontSize="10" fill={TEXT}>
              {r.work}
            </text>
          </g>
        ))}
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="10" fill={TEXT}>
          items of work (log y)
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-fd-muted-foreground">
        The cached read is a flat ~{rows[0]?.memoized} ns floor; recompute is O(work).
        They cross at ~3–4 items — below that, memoizing costs more than recomputing.
      </figcaption>
      <NumberTable
        head={["Items", "memoized", "recompute"]}
        rows={rows.map((r) => [String(r.work), fmt(r.memoized), fmt(r.recompute)])}
      />
    </figure>
  );
}

// ── shared bits ──
function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-4 text-xs text-fd-muted-foreground">
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function NumberTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <table className="mt-3 text-sm">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>
            {r.map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-width stat rows
              <td key={i}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
