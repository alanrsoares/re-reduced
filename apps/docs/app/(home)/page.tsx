import { ArrowRight, Layers, ShieldCheck, Workflow, Zap } from "lucide-react";
import Link from "next/link";
import { gitConfig } from "@/lib/shared";

const features = [
  {
    icon: Zap,
    title: "Signal-backed, fine-grained",
    body: "State lives in per-field signals. A component re-renders only when the slice it reads actually changes — no selector discipline, no memo juggling.",
  },
  {
    icon: ShieldCheck,
    title: "Typed to the bone",
    body: "Action payloads, derivations, and effect interpreters are fully inferred. Zero `any` in your app code, exhaustive intent coverage at compile time.",
  },
  {
    icon: Workflow,
    title: "Effects as data",
    body: "Side-effects are declared as intents and interpreted by the renderer adapter. The container stays pure, portable, and unit-testable.",
  },
  {
    icon: Layers,
    title: "Multi-renderer",
    body: "The same container definition runs under React and Preact. Server state stays in your data layer — re-reduced composes, it doesn't replace.",
  },
];

const SNIPPET = `const counter = defineContainer()("counter", {
  state: { count: 0 },
  actions: (on) => ({
    increment: on((s) => ({ count: s.count + 1 })),
    add: on<number>((s, n) => ({ count: s.count + n })),
  }),
  derive: ($) => ({ isEven: () => $.count.value % 2 === 0 }),
});

// in a component — re-renders only when \`count\` changes
const store = useContainer(counter);
const count = useSelect(store, (s) => s.count.value);
store.actions.add(5);`;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4">
      {/* hero */}
      <section className="flex w-full max-w-5xl flex-col items-center pt-20 pb-16 text-center sm:pt-28">
        <span className="mb-5 rounded-full border border-fd-border bg-fd-secondary/60 px-3 py-1 text-xs font-medium tracking-wide text-fd-muted-foreground">
          signal-backed · zero-any · multi-renderer
        </span>
        <h1 className="bg-gradient-to-b from-fd-foreground to-fd-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          re-reduced
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-fd-muted-foreground sm:text-xl">
          A typed, functional state-machine + effect container for
          component-scoped logic. It owns your transitions and effect intent —
          and delegates server state to your data layer.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
          >
            Documentation
          </Link>
          <a
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* code sample */}
      <section className="w-full max-w-3xl pb-20">
        <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-fd-border px-4 py-3">
            <span className="size-3 rounded-full bg-red-400/70" />
            <span className="size-3 rounded-full bg-yellow-400/70" />
            <span className="size-3 rounded-full bg-green-400/70" />
            <span className="ml-2 text-xs text-fd-muted-foreground">counter.ts</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code className="font-mono text-fd-foreground">{SNIPPET}</code>
          </pre>
        </div>
      </section>

      {/* features */}
      <section className="grid w-full max-w-5xl gap-4 pb-24 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40"
          >
            <div className="mb-3 inline-flex rounded-lg bg-fd-primary/10 p-2 text-fd-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="mb-1.5 font-semibold">{title}</h2>
            <p className="text-sm text-fd-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <p className="mb-16 text-center text-sm text-fd-muted-foreground">
        v1 (the Redux/redux-saga helper) is frozen and still published as{" "}
        <code className="rounded bg-fd-secondary px-1.5 py-0.5 text-xs">re-reduced@2</code>.
        v2 ships under the <code className="rounded bg-fd-secondary px-1.5 py-0.5 text-xs">@re-reduced/*</code> scope.
      </p>
    </main>
  );
}
