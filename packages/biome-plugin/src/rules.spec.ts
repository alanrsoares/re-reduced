import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";

const PKG_DIR = resolve(import.meta.dirname, "..");

function diagnosticsText(target: string): string {
  const { stdout } = spawnSync(
    "bunx",
    ["@biomejs/biome", "lint", "--reporter=json", target],
    { cwd: PKG_DIR, encoding: "utf8" },
  );
  const start = (stdout ?? "").indexOf("{");
  if (start === -1) return "[]";
  try {
    const report = JSON.parse(stdout.slice(start)) as { diagnostics?: unknown[] };
    return JSON.stringify(report.diagnostics ?? []);
  } catch {
    return "[]";
  }
}

describe("@re-reduced/biome-plugin — no-unstable-selector", () => {
  test("flags a selector returning an object literal", () => {
    expect(diagnosticsText("fixtures/invalid/unstable-object.ts")).toContain(
      "defeats the bail-out",
    );
  });

  test("flags a selector returning an array literal", () => {
    expect(diagnosticsText("fixtures/invalid/unstable-array.ts")).toContain(
      "defeats the bail-out",
    );
  });

  test("primitive-read selectors produce no diagnostics", () => {
    expect(diagnosticsText("fixtures/valid/stable.ts")).toBe("[]");
  });
});
