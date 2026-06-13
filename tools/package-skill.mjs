#!/usr/bin/env node
/**
 * package-skill.mjs — produce a distributable arc.skill (zip) artifact.
 *
 * Validates first (via validate-skill.mjs), then archives the skill folder
 * with the folder name as the zip root, excluding build junk. Output name
 * carries the version from the root package.json.
 *
 *   node tools/package-skill.mjs [--out dist]
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_DIR = join(ROOT, "skill", "arc");
const outIdx = process.argv.indexOf("--out");
const OUT_DIR = resolve(outIdx > -1 ? process.argv[outIdx + 1] : join(ROOT, "dist"));

// validate (throws on failure)
execFileSync("node", [join(ROOT, "tools", "validate-skill.mjs"), SKILL_DIR], { stdio: "inherit" });

const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
mkdirSync(OUT_DIR, { recursive: true });
const outFile = join(OUT_DIR, `arc-${version}.skill`);

// zip with the skill folder ("arc") as the archive root; exclude junk.
execFileSync(
  "zip",
  ["-r", "-q", outFile, "arc",
   "-x", "arc/**/__pycache__/*", "arc/**/*.pyc", "arc/**/.DS_Store", "arc/**/node_modules/*"],
  { cwd: join(ROOT, "skill"), stdio: "inherit" },
);

console.log(`packaged  ${outFile.replace(ROOT + "/", "")}`);
// also drop a stable, unversioned alias for convenience
execFileSync("cp", [outFile, join(OUT_DIR, "arc.skill")]);
console.log(`alias     ${join(OUT_DIR, "arc.skill").replace(ROOT + "/", "")}`);
