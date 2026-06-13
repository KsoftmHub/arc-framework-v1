# ARC framework

- ARC is a plan-driven development protocol installed in this project
- ARC = **Align → Refine → Construct**: capture the instruction, plan it, refine the plan when needed, only then build
- Every unit of development (feature, fix, refactor, integration, experiment) is an **arc** — one Markdown file in `.arc/` that holds its full story: raw instructions, plan, refinements, tasks, worklog, and status
- Any AI agent working in this repository must follow ARC across all development work

## Prime Directive

**No construction without an arc.**
Code, configs, schemas, infra, and docs are only changed under an arc that covers the change. If no arc covers it, create or extend one first (see Intake).

## Core Contract

- One arc file per unit of development; the arc is the single source of truth for that work's intent, plan, progress, and history
- Raw user instructions are **immutable and append-only** — never rewrite, summarize-in-place, or delete the user's words
- Plans evolve only through logged refinements, never by silent rewrite
- The codebase is truth for what currently *is*; arcs are truth for what was *asked*, what is *intended*, and what *happened*
- Every edit session ends with an Update After Editing pass — an edit without a worklog entry is an unfinished edit

## Layout

```
.arc/
├── INDEX.md            # registry of all arcs: id, title, status, next_id counter
├── _TEMPLATE.md        # copy this to start a new arc
├── ARC-0001-slug.md    # active arcs live flat in .arc/
├── ARC-0002-slug.md
├── notes/              # optional: long research spilled out of an arc (linked back)
└── archive/            # done/cancelled arcs move here; INDEX row remains
```

Arc filenames: `ARC-<NNNN>-<short-kebab-slug>.md`. IDs are sequential, never reused; take the next ID from `next_id` in INDEX.md and increment it.

## Lifecycle

```
draft ──► planned ──────────────► in-progress ──► review ──► done ──► (archive/)
            ▲                        │
            │                        │ scope change / new instruction
            └──────  refining  ◄─────┘
                (plan_version + 1)
any state ──► blocked (with reason) ──► back to prior state
any state ──► cancelled ──► (archive/)
```

The two sanctioned flows:

1. **Fast lane** — plan → develop: `draft → planned → in-progress → done`
2. **Refine lane** — plan → refine/update → develop: `draft → planned → refining → planned (v2…vN) → in-progress → done`

Rules:
- `in-progress` requires an approved plan — explicit user approval, or implicit when the user clearly said to just do it
- A new instruction arriving mid-construction sends the arc to `refining`; resume construction only after the plan and tasks absorb it
- `done` requires all acceptance criteria checked and all tasks `[x]` or `[-]`

## Intake (Align)

When the user gives a development instruction:

1. Read `.arc/INDEX.md`
2. Decide:
   - **Existing open arc covers it** → append the instruction verbatim to that arc's Raw Instructions, write a Refinement Log entry, update Plan and Tasks
   - **Existing arc is done/archived** → create a new arc and link it via `relates_to`; do not reopen closed arcs
   - **Nothing covers it** → copy `_TEMPLATE.md` to a new `ARC-NNNN-slug.md`, record the instruction verbatim as I1, draft the plan, register it in INDEX.md
3. Record the instruction **verbatim** — typos, voice-transcription noise, and all. If wording is ambiguous, add an `interpreted:` line beneath it stating your reading; if the interpretation changes scope or risk, confirm with the user before moving past `planned`
4. Trivial maintenance (typo-level, no design decision, ~minutes of work) may be logged as a worklog entry in the standing `ARC-0000-maintenance` arc instead of a new arc — but it is still logged

## Read Before Editing

Before touching any project file, in the current session:

1. Read `.arc/INDEX.md`
2. Open every arc whose `scope` covers the paths you expect to touch; read it fully — latest Raw Instructions, current Plan, open Tasks, and the last Worklog entries
3. Read the actual source files you will change as they exist now
4. If the project also has an AGENTS.md / DOX tree or similar, walk it too — arcs govern *what to build*; those docs govern *how to work in this codebase*
5. If no arc covers a non-trivial change, stop and run Intake first

Do not rely on memory from previous sessions or on the model's assumptions about file contents. Re-read the applicable arc chain and target files before editing.

## Update After Editing

Immediately after editing — same session, before reporting the task as done:

1. Advance task states in the arc's Tasks section
2. Append one Worklog entry: timestamp, tasks advanced, files read, files changed, summary, decisions made, follow-ups discovered
3. Update frontmatter: `updated` date and `status`; bump `plan_version` only if the Plan section changed
4. Sync the arc's row in `.arc/INDEX.md` (status, updated)
5. Reference the arc ID in the commit message: `[ARC-0007] add redis limiter`
6. On completion: check acceptance criteria, set `done`, move the file to `.arc/archive/`, keep the INDEX row pointing at the new path

## Refinement Rules

- Every new instruction on existing work becomes a numbered Raw Instruction entry (I2, I3, …) — verbatim, dated, with its source (chat, voice, issue, review)
- Each refinement gets a Refinement Log entry: new `plan_version`, date, triggering instruction, what changed in the plan, and its task impact (tasks added / modified / removed)
- The Plan section always shows only the **current** plan; history lives in the Refinement Log — never maintain two competing plans in one arc
- Removed scope is moved to "Out of scope" with a one-line reason, not silently deleted

## Status & Task Vocabulary

Statuses: `draft` · `planned` · `refining` · `in-progress` · `blocked` · `review` · `done` · `cancelled`

Task markers:

```
- [ ] T1 pending
- [>] T2 in progress        (at most one or two at a time)
- [x] T3 done
- [!] T4 blocked: <reason>
- [-] T5 cancelled: <reason>
```

Tasks are numbered `T1, T2, …` within an arc and never renumbered; new tasks append. Reference them everywhere as `ARC-0007/T3`.

## Conflict & Drift

- If an arc and the codebase disagree, the codebase is truth for the current state — record the drift in the Worklog, then fix the arc
- Newer raw instructions override older ones within an arc; note the override in the Refinement Log
- Arcs never weaken repository-wide rules, safety constraints, or verification requirements defined in AGENTS.md / DOX / CI

## Session Resume

Any agent, any tool, any time can resume work cold:

1. Read `.arc/INDEX.md` → find arcs in `in-progress`, `refining`, or `blocked`
2. Open each, read Status Notes and the last Worklog entry
3. Continue from the open `[>]`/`[ ]` tasks — after running Read Before Editing

This is the crash-recovery property: the arc, not the chat history, carries the state.

## Style

- Concise and operational; a plan is a contract, not an essay
- Acceptance criteria must be objectively checkable
- Keep an arc under ~300 lines; spill long research or option analysis to `.arc/notes/ARC-NNNN-topic.md` and link it
- Append-only sections (Raw Instructions, Refinement Log, Worklog) are never edited retroactively; everything else is kept current and stale text is removed
- Worklog entries record facts and decisions, not narration

## Coexistence

ARC composes with AGENTS.md, CLAUDE.md, DOX, and editor rule files. Division of labor: those describe the codebase and working conventions; ARC tracks intent, plans, and progress. If this file is referenced from an AGENTS.md, treat ARC as binding for all development work.

## Initialization

If `.arc/` does not exist yet, initialize ARC now before any other work:

1. Create `.arc/INDEX.md` with an empty registry and `next_id: ARC-0001`
2. Create `.arc/_TEMPLATE.md`, `.arc/notes/`, `.arc/archive/`
3. Create `ARC-0000-maintenance.md` as the standing trivial-fix arc (status: `in-progress`, perpetual)
4. If the user already gave development instructions, run Intake on them immediately
