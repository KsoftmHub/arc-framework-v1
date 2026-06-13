---
id: ARC-0000
title: <short imperative title>
status: draft            # draft | planned | refining | in-progress | blocked | review | done | cancelled
created: YYYY-MM-DD
updated: YYYY-MM-DD
plan_version: 1
owner: <user / team>
scope: []                # paths this arc owns or touches, e.g. [src/api/, prisma/schema.prisma]
depends_on: []           # arc IDs that must be done first, e.g. [ARC-0003]
relates_to: []           # related arc IDs (context, successors of closed arcs)
tags: []                 # e.g. [api, infra, bugfix]
---

# ARC-0000 · <Title>

## 1 · Raw Instructions
<!-- Append-only. Verbatim user words — never edited, never deleted. -->

### I1 — YYYY-MM-DD (source: chat | voice | issue | review)
> <exact instruction text>

interpreted: <optional — your plain reading of an ambiguous/voice-noisy instruction; confirm with the user if it changes scope>

## 2 · Plan (current — v1)
<!-- Always reflects the CURRENT plan only. History lives in §3. -->

**Goal:** <one sentence — what exists when this arc is done>

**Approach:** <how, in a few lines — key technical decisions>

**In scope:**
- <…>

**Out of scope:**
- <…> — <reason>

**Acceptance criteria:** <!-- objectively checkable -->
- [ ] AC1 <…>
- [ ] AC2 <…>

**Affected paths:** <files/dirs expected to change — keep frontmatter `scope` in sync>

**Risks / unknowns:** <optional>

## 3 · Refinement Log
<!-- Append-only. One entry per plan version bump. Empty until the first refinement. -->

<!--
### v2 — YYYY-MM-DD — triggered by I2
- changed: <what changed in the plan and why>
- task impact: added T5–T6; modified T3; cancelled T4
-->

## 4 · Tasks
<!-- Numbered T1, T2, … — never renumber; append new tasks at the end.
     Markers: [ ] pending · [>] in progress · [x] done · [!] blocked: reason · [-] cancelled: reason -->

- [ ] T1 <…>
- [ ] T2 <…>
- [ ] T3 <…>

## 5 · Worklog
<!-- Append-only. One entry per Update-After-Editing pass. Newest at the bottom. -->

<!--
### YYYY-MM-DD HH:MM — <one-line session note>
- tasks: T1 [>]→[x]; T2 →[>]
- read: <files read before editing>
- changed: <files created/modified/deleted>
- summary: <what was actually done>
- decisions: <choices made and why, if any>
- follow-ups: <new tasks, questions for the user, discovered debt>
-->

## 6 · Status Notes
<!-- Kept current — overwrite freely. The one place to glance for "where is this?" -->

**Current:** <one-line truth of where this stands>
**Blockers:** <none | …>
**Next:** <the very next action>
