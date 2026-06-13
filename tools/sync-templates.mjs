#!/usr/bin/env node
/**
 * sync-templates.mjs — single source of truth enforcement.
 *
 * Canonical templates live in /templates. This tool copies them into every
 * artifact that must ship its own copy (the skill's assets, the skill's
 * protocol reference, the npm package), or verifies they're identical.
 *
 *   node tools/sync-templates.mjs           # copy canonical -> destinations
 *   node tools/sync-templates.mjs --check   # CI mode: exit 1 on drift
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "templates");

const DEST_DIRS = [
  join(ROOT, "skill", "arc", "assets", "templates"),
  join(ROOT, "packages", "create-arc", "templates"),
];
// The skill's protocol reference is the same document as the ARC.md template.
const EXTRA_FILES = [
  { src: join(SRC, "ARC.md"), dest: join(ROOT, "skill", "arc", "references", "protocol.md") },
];

const check = process.argv.includes("--check");
const files = readdirSync(SRC).filter((f) => f.endsWith(".md"));
let drift = 0;

function compare(src, dest, label) {
  if (!existsSync(dest) || readFileSync(dest, "utf8") !== readFileSync(src, "utf8")) {
    console.error(`DRIFT  ${label}`);
    drift++;
  }
}

for (const dir of DEST_DIRS) {
  for (const f of files) {
    const src = join(SRC, f);
    const dest = join(dir, f);
    if (check) {
      compare(src, dest, dest.replace(ROOT + "/", ""));
    } else {
      mkdirSync(dir, { recursive: true });
      cpSync(src, dest);
      console.log(`sync   ${dest.replace(ROOT + "/", "")}`);
    }
  }
}
for (const { src, dest } of EXTRA_FILES) {
  if (check) {
    compare(src, dest, dest.replace(ROOT + "/", ""));
  } else {
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(src));
    console.log(`sync   ${dest.replace(ROOT + "/", "")}`);
  }
}

if (check) {
  if (drift) {
    console.error(`\n${drift} file(s) out of sync. Run: node tools/sync-templates.mjs`);
    process.exit(1);
  }
  console.log("templates in sync ✔");
}
