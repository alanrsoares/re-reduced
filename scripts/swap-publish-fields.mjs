#!/usr/bin/env node
// npm's publishConfig field promotion doesn't fire for main/module/types/exports
// on this toolchain (verified: plain `npm pack` leaves them untouched). prepack
// swaps them in from publishConfig for the tarball; postpack restores the
// dev-facing (src) values so the workspace keeps resolving packages to source.
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2];
const pkgPath = join(process.cwd(), "package.json");
const backupPath = `${pkgPath}.dev`;

if (mode === "prepack") {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const { publishConfig } = pkg;
  if (!publishConfig) throw new Error("no publishConfig to swap in");
  writeFileSync(backupPath, `${JSON.stringify(pkg, null, 2)}\n`);
  writeFileSync(
    pkgPath,
    `${JSON.stringify({ ...pkg, ...publishConfig }, null, 2)}\n`,
  );
} else if (mode === "postpack") {
  writeFileSync(pkgPath, readFileSync(backupPath));
  unlinkSync(backupPath);
} else {
  throw new Error(`unknown mode: ${mode}`);
}
