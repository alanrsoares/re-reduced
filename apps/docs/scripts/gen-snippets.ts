#!/usr/bin/env bun
/**
 * re-reduced config for `@onrails/twoslash`.
 *
 * The engine is project-agnostic; this file holds only the re-reduced
 * specifics: where the snippet modules live and where the generated module
 * goes. Snippets import `@re-reduced/*` directly (the demos package depends on
 * them and `lib/twoslash.ts` maps the specifiers to source), so no import
 * rewriting is needed.
 */
import { resolve } from "node:path";
import { extractSnippets } from "@onrails/twoslash";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");

const { count, outFile, skipped } = await extractSnippets({
  srcDir: resolve(REPO_ROOT, "packages/demos/src/snippets"),
  outFile: resolve(import.meta.dirname, "../lib/snippets.generated.ts"),
  sourceLabel: "packages/demos/src/snippets/*.ts",
  generatedBy: "scripts/gen-snippets.ts",
});

for (const name of skipped) console.warn(`skip ${name}.ts: no #region snippet`);
console.log(`Wrote ${count} snippets to ${outFile}`);
