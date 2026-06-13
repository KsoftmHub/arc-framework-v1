# ARC — Align · Refine · Construct

**Plan-driven development for AI agents, in pure Markdown.** Shipped as a **Claude skill** and an **npm scaffolder**, with a production CI/CD pipeline.

ARC makes any AI coding agent **plan before it builds, keep the plan honest while it builds, and leave an audit trail after it builds**. Every unit of work is an *arc*: one Markdown file in `.arc/` holding the user's raw instructions (verbatim, append-only), the current plan, a refinement log, a task list, a worklog, and a status. The two sanctioned flows are **plan → develop** and **plan → refine/update → develop**.

Inspired by [DOX](https://github.com/agent0ai/dox). DOX keeps agents honest about *what the code is*; ARC keeps them honest about *what was asked, what the plan is, and what got done*. They compose — use both.

---

## Table of contents

- [Why ARC](#why-arc)
- [What this repository ships](#what-this-repository-ships)
- [Quick start](#quick-start)
  - [As a Claude skill](#as-a-claude-skill)
  - [As a CLI](#as-a-cli)
- [How an arc works](#how-an-arc-works)
- [The protocol in one screen](#the-protocol-in-one-screen)
- [CLI reference](#cli-reference)
- [Repository layout](#repository-layout)
- [Single source of truth](#single-source-of-truth)
- [CI/CD](#cicd)
- [Production deployment](#production-deployment)
- [Local development](#local-development)
- [FAQ](#faq)
- [License](#license)

---

## Why ARC

AI agents lose the plot across sessions. Context windows reset, chat history scrolls away, and the *why* behind a change evaporates — so the next session re-derives intent from the code and often gets it wrong. ARC fixes this by writing the plan down, in the repo, in a structured file the agent must read before editing and update after editing.

The payoff:

- **Nothing is built without a plan.** Instructions become arcs; arcs carry checkable acceptance criteria.
- **Plans evolve honestly.** Every change of mind is a logged, versioned refinement — never a silent rewrite.
- **Cold resume.** Any agent, any tool, any time picks up from the arc's last worklog entry — not from scrollback.
- **Auditability.** Raw instructions, refinements, and worklogs are append-only. You can always see what was asked and what happened.
- **Universal.** Pure Markdown plus zero-dependency tooling — works in any language, with any agent that can read files.

---

## What this repository ships

| Artifact | Path | What it is |
|---|---|---|
| **Skill** | [`skill/arc/`](skill/arc/) | A Claude skill (`SKILL.md` + scripts + protocol reference) so Claude natively runs ARC — detects `.arc/`, files instructions, plans, refines, logs. |
| **npm package** | [`packages/create-arc/`](packages/create-arc/) | [`@ksoftm/create-arc`](https://www.npmjs.com/package/@ksoftm/create-arc) — scaffold and drive ARC from any terminal, zero deps. |
| **Templates** | [`templates/`](templates/) | Canonical `ARC.md`, `INDEX.md`, `_TEMPLATE.md`, `ARC-0000` — the single source of truth both artifacts embed. |

---

## Quick start

### As a Claude skill

Install the bundled skill so Claude becomes a native ARC agent.

1. Get `dist/arc.skill` — download it from the latest [GitHub Release](https://github.com/KsoftM/arc/releases), or build it locally with `npm run package`.
2. In Claude, go to **Settings → Capabilities → Skills** and upload `arc.skill`.

From then on, just give development instructions. Claude detects any repo containing `.arc/` or `ARC.md`, files each instruction into an arc verbatim, plans it, refines when you change your mind, builds, and logs progress.

### As a CLI

In any project, with Node ≥ 18:

```bash
npx @ksoftm/create-arc init                          # scaffold ARC.md + .arc/
npx @ksoftm/create-arc new "Add per-key rate limit" --tags api,infra
npx @ksoftm/create-arc status                         # every arc at a glance
npx @ksoftm/create-arc doctor                         # verify the registry is consistent
```

Then point your agent at `ARC.md` (or add the pointer below to your `AGENTS.md` / `CLAUDE.md`):

```markdown
## ARC (plan-driven development)
This project uses ARC. Before any development work, read ./ARC.md and follow it:
no code changes without an arc in .arc/ — Read Before Editing, Update After Editing.
```

---

## How an arc works

Each arc file is one unit of development, in a fixed section order:

1. **Raw Instructions** — the user's words, verbatim and append-only. Voice-transcription noise is preserved; an `interpreted:` line records the agent's reading of anything ambiguous (and scope-changing interpretations get confirmed before construction).
2. **Plan** — the *current* plan only, with objectively checkable acceptance criteria. History never lives here.
3. **Refinement Log** — one append-only entry per plan-version bump: what changed, why, and the task impact.
4. **Tasks** — numbered `T1, T2, …` (never renumbered), each with a live marker: `[ ]` pending · `[>]` in progress · `[x]` done · `[!]` blocked · `[-]` cancelled.
5. **Worklog** — one append-only entry per edit session: tasks advanced, files read, files changed, summary, decisions, follow-ups.
6. **Status Notes** — a one-glance "where is this?" kept current.

YAML frontmatter (`id`, `status`, `scope`, `plan_version`, `depends_on`, `relates_to`, `tags`, dates) makes arcs machine-readable for tooling, dashboards, and CI gates.

---

## The protocol in one screen

The binding ruleset is [`templates/ARC.md`](templates/ARC.md) (installed into every project, and embedded in the skill as `references/protocol.md`). The essentials:

**Lifecycle**

```
draft → planned → in-progress → review → done → (archive/)
            ▲            │
            └─ refining ◄┘   (a new instruction bumps plan_version, then construction resumes)
```

**Read Before Editing** — in the current session, before touching any file: read `INDEX.md`, fully read every arc whose `scope` covers your target paths, read the real source files as they exist now, and walk any `AGENTS.md`/`DOX` docs. No covering arc for a non-trivial change → run Intake first. Never edit from memory or assumption.

**Update After Editing** — immediately after editing, before reporting done: advance task states, append a worklog entry, update frontmatter (`updated`, `status`, and `plan_version` if the plan changed), sync the `INDEX.md` row, and tag the commit (`[ARC-0007] add redis limiter`). On completion: verify acceptance criteria, set `done`, move the file to `.arc/archive/`. **An edit without a worklog entry is an unfinished edit** — that is what makes cold resume possible.

**Refine** — a new instruction on existing work is appended verbatim as the next `I<n>`, logged as a refinement with task impact, and folded into the current plan; dropped scope moves to "Out of scope" with a reason. Append-only sections are never edited retroactively.

---

## CLI reference

| Command | What it does |
|---|---|
| `init [dir]` | Scaffold `ARC.md` + `.arc/` (index, template, standing maintenance arc, `notes/`, `archive/`). Idempotent — never overwrites. |
| `new "Title" [--dir=.] [--tags=a,b]` | Take the next sequential ID, create the arc from the template, register its index row, bump `next_id`. |
| `status [dir] [--json]` | Table (or JSON) of every arc: ID, status, plan version, task progress, resume hints. |
| `doctor [dir]` | Consistency checks — index ↔ file bijection, ID/`next_id` sanity, valid statuses. Exits non-zero on problems. |

Options: `--owner NAME` (defaults to `git config user.name`), `--tags a,b`, `--json`, `--version`, `--help`.

The skill ships the same three operations as zero-dependency Python scripts (`scripts/arc_init.py`, `arc_new.py`, `arc_status.py`) so Claude can run them directly in its sandbox.

---

## Repository layout

```
arc/
├── templates/                    canonical protocol + .arc files (SOURCE OF TRUTH)
│   ├── ARC.md
│   ├── INDEX.md
│   ├── _TEMPLATE.md
│   └── ARC-0000-maintenance.md
├── skill/arc/                    the Claude skill
│   ├── SKILL.md                  triggering + workflow
│   ├── references/protocol.md    ← synced from templates/ARC.md
│   ├── scripts/                  arc_init / arc_new / arc_status (Python, zero-dep)
│   └── assets/templates/         ← synced copies of templates/
├── packages/create-arc/          the npm scaffolder
│   ├── bin/cli.js                init / new / status / doctor (Node, zero-dep)
│   ├── templates/                ← synced copies of templates/
│   ├── test/cli.test.mjs         node:test suite
│   └── package.json
├── tools/                        sync-templates, validate-skill, package-skill, smoke-test
└── .github/workflows/            ci.yml, release.yml
```

---

## Single source of truth

The templates exist exactly once, in [`templates/`](templates/). [`tools/sync-templates.mjs`](tools/sync-templates.mjs) copies them into the skill's `assets/templates/`, the skill's `references/protocol.md`, and the npm package's `templates/`. CI runs it with `--check` to fail the build on any drift.

Edit templates in one place, then:

```bash
npm run sync          # regenerate every embedded copy
npm run sync:check    # verify everything is in sync (what CI runs)
```

---

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) — on every push and PR to `main`:

- **validate** — template drift check, `SKILL.md` validation (mirrors the Skills API rules), and a Python smoke test exercising the three skill scripts end-to-end.
- **test-cli** — the `create-arc` test suite across **Node 18 / 20 / 22** on **Linux, Windows, and macOS**.
- **package** — builds `dist/arc.skill` and uploads it as a workflow artifact.

[`.github/workflows/release.yml`](.github/workflows/release.yml) — on a `v*.*.*` tag:

- Re-runs the full validation suite.
- **Verifies the tag matches the package version** (a mismatched tag fails before anything publishes).
- **Publishes [`@ksoftm/create-arc`](https://www.npmjs.com/package/@ksoftm/create-arc) to npm with provenance** (OIDC-signed).
- Creates a **GitHub Release** with the `.skill` attached and auto-generated notes.

---

## Production deployment

**One-time setup**

1. Create the GitHub repo `KsoftM/arc` and push this tree to `main`. CI runs immediately.
2. Add a repository secret **`NPM_TOKEN`** — an npm **Automation** access token (npm → *Access Tokens* → *Generate New Token* → *Automation*). Required for publishing.
3. Confirm the npm org/scope `@ksoftm` exists and your token can publish to it.

**Cut a release** (this is the entire flow — one tag does everything):

```bash
cd packages/create-arc && npm version patch && cd ../..   # 1.0.0 → 1.0.1 (also makes a commit + tag in the subdir)
# bump the root version to match (keep them in lockstep):
npm version 1.0.1 --no-git-tag-version

git add -A && git commit -m "[ARC-0000] release v1.0.1"
git tag v1.0.1
git push && git push --tags
```

The pushed tag triggers `release.yml`, which validates, checks the tag/version match, publishes to npm with provenance, and drafts the GitHub Release with the `.skill` asset. Nothing publishes if any check fails.

> **Tip:** keep the root `package.json` and `packages/create-arc/package.json` versions identical — the release workflow's tag-match guard checks the package version, and lockstep versions keep the GitHub Release and the npm release in agreement.

---

## Local development

```bash
npm install                 # wires the workspace (Node ≥ 18)

npm run check               # the full local gate: sync:check + validate + smoke + CLI tests
# or run pieces individually:
npm run sync                # regenerate embedded templates after editing templates/
npm run validate            # validate SKILL.md
npm run smoke               # Python smoke test of the skill scripts
npm test                    # CLI test suite
npm run package             # build dist/arc.skill (+ versioned alias)
```

Requirements: Node ≥ 18 and Python ≥ 3.8 (smoke test only; the shipped tooling itself is dependency-free).

---

## FAQ

**Does ARC replace AGENTS.md / DOX / CLAUDE.md?** No — it complements them. Those describe the codebase and working conventions (*how to work here*); ARC tracks intent, plans, and progress (*what to build and why*). If referenced from an `AGENTS.md`, ARC is binding for development work.

**Do I need the skill and the CLI?** No. The CLI scaffolds and inspects ARC from any terminal and works with any agent. The skill additionally teaches Claude the full protocol so it runs ARC autonomously. Use either or both.

**Where do plans live?** In `.arc/`, one Markdown file per unit of work, committed alongside your code.

**Is anything sent anywhere?** No. ARC is local Markdown files and local tooling. There is no telemetry, no network calls, no runtime.

**What about trivial fixes?** They go in the standing `ARC-0000-maintenance` arc as a worklog entry — traceable, without per-fix ceremony.

---

## License

MIT — see [LICENSE](LICENSE). Concept credit: [DOX / agent0ai](https://github.com/agent0ai/dox).
