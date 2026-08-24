# CLAUDE.md

Project context for AI coding sessions. Read `PRD.md` for the full specification. This file is the short version plus the rules that must never be broken.

## What we are building

An internal Bajaj Auto web app that runs the annual Self Development Plan cycle. Four roles: Employee, Manager, BUHR, TD Admin. An employee writes a six-question reflection, sets one to three development goals, submits, has a growth conversation with their manager, and updates progress at four checkpoints across the year. HR roles track completion but never read the content.

Full spec: `PRD.md`. Every requirement has a stable ID such as `FR-EMP-042`. Reference these IDs in commit messages, test names and PR descriptions.

## Non-negotiables

These are correctness requirements, not preferences. If a change would violate one of these, stop and flag it.

1. **Journal privacy.** `journal_entries` rows are returned only to their own author. Never to a manager, BUHR, TD Admin, an export, the Letter, the PDF, the DC Tool payload, an email, an analytics event, or an application log. Enforce at the data-access layer, not the controller. See PRD 8.9 and 22.3.
2. **HR roles never see content.** BUHR and TD Admin responses are built from a status-only DTO that has no reflection, goal, feedback or check-in text fields defined on it at all. Not "filtered out" at render time. See PRD 10.1 and 19.3.
3. **Sharing scope is a server-side projection.** A `GOALS_ONLY` reportee response must not contain reflection fields anywhere in the payload. Never rely on the front end to hide them. See PRD 12.6.
4. **Never show "Saved" without a server acknowledgement.** Autosave failures must be visible, retried and buffered. Reflection content is not recoverable from anywhere else. See PRD 12.1.
5. **No em-dashes or en-dashes in any product copy**, including emails, errors, tooltips and PDFs. Use commas, colons, or restructure. There is a CI lint rule for this. See PRD 15.3.
6. **Monochrome blue only.** The palette in PRD 15.1 is complete. Green and light red appear only as status chips. Do not introduce a new accent colour.
7. **Server-side authorisation on every route.** Front-end route guards are convenience only.

## Shared vocabulary

Defined once in a shared types module, imported everywhere, never re-declared:

`SdpStatus`, `SharingScope`, `GoalDomain`, `CheckInPeriod`, `CheckInStatus`, `FeedbackType`, `Milestone`, `MilestoneState`, `Role`. Full definitions in PRD 22.2.

The nine milestones are the spine of the product. They are the nine dashboard columns, the nine BUHR nudge templates, and the employee timeline. Same enum in all three places. See PRD 7.2.

## Conventions

- All product copy lives in a single content module, never inline in components.
- Static content (FAQ, checklist, response guides, priming prompts, sample goals, LCFW) is structured data, not hard-coded markup, so TD can edit it without a code change.
- Any content not yet supplied renders as a styled placeholder state, never a broken or empty screen. See PRD 21.1 for what is still missing.
- Design tokens live in one file, sourced from PRD 15.1.
- Seed fixtures should be realistic: roughly 200 employees, 20 managers, 3 BUs, 2 BUHRs, and SDPs at every lifecycle state.

## Test priorities

In this order:

1. Content projection by role (PRD FR-NFR-018). The single most important regression test in the product.
2. Journal isolation.
3. Sharing scope enforcement.
4. Milestone state machine, including `NOT_DUE` versus `PENDING` transitions.
5. Autosave, including the failure path.
6. Immutability after submit, share and check-in.

## Open questions

PRD Section 21 lists 21 unresolved items including the technology stack, the cycle dates, the DC Tool API contract and the Q1 word-chip behaviour. Do not invent answers to these. Ask, or implement behind a clearly marked assumption and note it.

## Build order

PRD Section 20.1. Short version: foundations, then employee core, then Journal and Letter, then Manager, then BUHR tracking, then TD Admin, then the year-round check-in flow, then integrations and content.
