import { resolve } from "node:path";
import ts from "typescript";

// Resolve @re-reduced/* to source (not built dist) so hover types never go
// stale. Shared by the MDX pipeline (source.config.ts) and the server-rendered
// snippets (components/twoslash-snippet.tsx). Build/codegen always run from
// apps/docs, so the repo root is two levels up. (Avoid `new URL(import.meta.url)`
// here — the bundler treats it as an asset import.)
const repoRoot = resolve(process.cwd(), "../..");

export const twoslashCompilerOptions = {
  baseUrl: repoRoot,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  paths: {
    "@re-reduced/core": ["packages/core/src/index.ts"],
    "@re-reduced/react": ["packages/react/src/index.ts"],
    "@re-reduced/preact": ["packages/preact/src/index.ts"],
    "@re-reduced/signals": ["packages/signals/src/index.ts"],
    "@re-reduced/adapter-kit": ["packages/adapter-kit/src/index.ts"],
  },
};
