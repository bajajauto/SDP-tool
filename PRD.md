# Self Development Plan (SDP) Tool
## Product Requirements Document

| Field | Value |
|---|---|
| Product | Self Development Plan Tool |
| Organisation | Bajaj Auto |
| Cycle | 2026 to 27 |
| Document version | 1.0 (Draft) |
| Source | Derived from "SDP Systems Requirements Document" |
| Status | For review. Open items tracked in Section 21. |
| Primary audience | Engineering (including AI coding agents), Design, TD/HR stakeholders |

> **How to use this document with an AI coding agent:** Section 20 contains the build order and repo conventions. Every functional requirement carries a stable ID (for example `FR-EMP-042`). Reference these IDs in commits, tests, and task prompts so implementation stays traceable to the spec. Section 21 lists everything that is still undecided. Do not invent answers to those items. Stop and ask.

---

## Contents

1. Product Overview
2. Personas
3. Glossary
4. Domain and Data Model
5. Employee Central Integration
6. Authentication, Authorisation, Hosting
7. Lifecycle and State Machine
8. Employee Experience
9. Manager Experience
10. BUHR Experience
11. TD Admin Experience
12. Cross-Cutting Rules
13. Email and Notification System
14. Sample Leader SDPs (BU-aware)
15. Visual Design System
16. Responsive and Accessibility
17. Downstream Integration
18. Non-Functional Requirements
19. Technical Architecture and API Surface
20. Build Guidance
21. Open Questions
22. Appendix (including the privacy summary table)

---

## 1. Product Overview

### 1.1 What this is

The SDP Tool is an internal web application that runs Bajaj Auto's annual Self Development Plan process end to end. It replaces the current fragmented approach (documents, spreadsheets, email threads) with a single source of truth for employee reflection, goal setting, manager coaching conversations, and HR tracking across the full annual cycle.

The product is deliberately structured as a **guided reflective journey**, not a form. An employee moves through four narrative chapters (Who I am, What drives me, Where I stand, Who I want to become), arrives at a small number of concrete development goals, has a structured conversation with their manager, and then tracks progress through four checkpoints across the year.

### 1.2 Why it exists

| Problem today | What the tool does about it |
|---|---|
| Development planning happens once and is then forgotten | Quarterly check-in structure with email nudges keeps it live all year |
| No visibility for HR on who has actually done what | Real-time tracking dashboard with per-milestone status for BUHR and TD Admin |
| Employees find open-ended reflection intimidating | Response Guides, priming prompts, sample leader SDPs, worked weak-versus-strong examples |
| Reflection content is personal, but HR needs progress data | Strict separation: HR sees status and metadata only, never reflection content |
| Manager feedback is ad hoc and undocumented | Three structured, timestamped, lockable feedback moments |
| Development goals do not reach the Development Centre process | Automated outbound sync of goals to the DC Tool |

### 1.3 Product principles

1. **Privacy is a feature, not a setting.** The Journal is never visible to anyone but its author. HR roles never see reflection content. The employee controls how much of their SDP the manager sees. These are enforced server side, not just hidden in the UI.
2. **Never lose a word.** Reflection is effortful. Autosave, draft persistence across devices and sessions, and a visible "last saved" indicator are core, not polish.
3. **Guide, do not gate.** Priming questions, response guides and samples are always one click away and always optional. The only hard gates are the minimum-length validations.
4. **Calm, monochrome, adult.** A single blue family, minimal iconography, serif accents. The interface should feel like a well-made notebook, not a gamified app.
5. **The tool comes to the user.** Email triggers mean nobody has to log in speculatively to discover that something happened.

### 1.4 Scope

**In scope for v1**
- Full employee reflection, goal setting and submission flow
- Manager team view, reportee detail view and three feedback moments
- Employee dashboard with four check-in milestones and support needs
- BUHR tracking dashboard scoped to BU, with manual nudges and Excel export
- TD Admin org-wide dashboard, cycle configuration, template management, audit log
- My Journal and My Letter persistent tabs, including Letter PDF export
- One-way Employee Central (EC) data sync
- Automated and manual email system
- Outbound goal sync to the DC Tool
- Responsive layout down to 480px

**Explicitly out of scope for v1**
- Any write-back to EC
- Performance ratings, appraisal linkage or compensation linkage
- Peer or 360 degree feedback
- Native mobile applications
- In-app chat or messaging
- Multi-year historical comparison views (the Letter PDF is the carry-forward artefact instead)
- Learning content catalogue or LMS integration
- Multi-language support (English only for v1)

### 1.5 Success metrics

| Metric | Target | Source |
|---|---|---|
| SDP submission rate (eligible employees) | 85% by cycle mid-point | Tracking dashboard |
| Growth conversations confirmed | 80% of submitted SDPs | Milestone data |
| Manager plan feedback shared | 75% of submitted SDPs | Milestone data |
| Q1 check-in completion | 60% of submitted SDPs | Milestone data |
| Year-end check-in completion | 70% of submitted SDPs | Milestone data |
| Draft abandonment (started reflection, never submitted) | Below 20% | Analytics funnel |
| Median time from first login to submission | Under 21 days | Analytics |
| Support tickets about lost work | Zero | Helpdesk |

---

## 2. Personas

### 2.1 Employee

The primary user. Any active Bajaj Auto employee who joined on or before the hire-date cut-off for the cycle. Completes their own reflection, sets one to three goals, has a growth conversation with their manager, and updates progress four times across the year. Keeps a private journal.

**Needs:** clarity on what is being asked, reassurance that this is not an appraisal, confidence that private notes stay private, and the ability to pick up where they left off.

### 2.2 Manager

An employee who has at least one direct reportee mapped in EC. Uses the tool in both capacities. Sees a "My Team" tab in addition to their own SDP. Provides three rounds of written feedback and actions support requests.

**Needs:** a fast way to see who has and has not submitted, enough context to have a useful conversation, and a record of what they committed to.

**Important:** manager status is derived from EC manager mapping, not assigned manually. A manager with zero reportees does not see the My Team tab.

### 2.3 BUHR (HRBP)

Human Resources Business Partner assigned to one or more Business Units. Tracks completion across their BU, nudges laggards, and exports data for BU leadership reviews. Cannot read reflection content.

**Needs:** a filterable at-a-glance grid, one-click nudging that comes from their own name, and clean exports.

### 2.4 TD Admin

Talent Development administrator. Owns the cycle itself: configuration, dates, system email templates, org-wide reporting, audit. Sees everything BUHR sees but across all BUs. Cannot read reflection content or journals.

**Needs:** control over cycle timing and comms, org-level completion visibility, and an auditable record.

### 2.5 Persona summary matrix

| Capability | Employee | Manager | BUHR | TD Admin |
|---|---|---|---|---|
| Own SDP (reflect, goals, submit) | Yes | Yes | Yes | Yes |
| Own Journal | Yes | Yes | Yes | Yes |
| Own Letter and PDF | Yes | Yes | Yes | Yes |
| See reportee shared SDP content | No | Own reportees only | No | No |
| See any reflection content of others | No | Per sharing scope | Never | Never |
| See others' Journal | Never | Never | Never | Never |
| Give plan / mid-year / year-end feedback | No | Own reportees only | No | No |
| Milestone status dashboard | Own only | Own reportees | Own BU | All BUs |
| Send nudges | No | No | Own BU | Yes (bulk) |
| Edit email templates | No | No | Own BU nudge templates | All auto-trigger templates and defaults |
| Export to Excel | No | No | Own BU filtered view | Org filtered view |
| Configure cycle | No | No | No | Yes |
| View audit log | No | No | No | Yes |

Every role listed above is also an Employee first. Elevated roles are additive.

---

## 3. Glossary

| Term | Definition |
|---|---|
| **SDP** | Self Development Plan. One per employee per cycle. Contains reflection (Q1 to Q6) plus one to three goals. |
| **Cycle** | The annual period, for example 2026 to 27. Defined by start date, mid-year cut-off, year-end cut-off, hire-date cut-off. |
| **EC** | Employee Central, the SAP SuccessFactors HR master system. The source of truth for all people data. |
| **DC Tool** | The existing Development Centre tool. Receives submitted goals downstream. |
| **LCFW** | Leadership Competency Framework Wheel. Four pillars (Will, Energy, Understanding, Capability) with three sub-dimensions each. |
| **Milestone** | One of nine trackable events in the cycle. See Section 7.2. |
| **Sharing scope** | The employee's choice at submission: FULL or GOALS_ONLY. |
| **Growth conversation** | The structured manager conversation that happens after SDP submission and before manager plan feedback. |
| **Check-in** | A quarterly progress update by the employee against their goals. Four in a cycle: Q1, Mid-Year, Q2, Year-End. |
| **Support need** | An item an employee flags on their dashboard as help required. Visible to the manager. |
| **Nudge** | A manual reminder email sent by BUHR from their own email address. |
| **Auto-trigger** | A system email sent automatically on an event, from the TD Admin email address. |
| **Letter** | An auto-composed narrative document built from the employee's own reflection and goals. |
| **Journal** | A private, permanently unshared freeform notes area. |

---

## 4. Domain and Data Model

### 4.1 Entity relationship overview

```
Cycle 1---* SDP *---1 Employee
                |
                +--1---1 Reflection (Q1 to Q6)
                +--1---* Goal (1 to 3) --1---1 ActionPlan (Do / Learn / Connect)
                +--1---* CheckIn (Q1, MID_YEAR, Q2, YEAR_END)
                +--1---* ManagerFeedback (PLAN, MID_YEAR, YEAR_END)
                +--1---* SupportNeed
                +--1---* MilestoneStatus (9 rows, derived or materialised)

Employee 1---* JournalEntry            (never linked to a cycle's shared surface)
Employee *---1 Employee (manager)      (from EC)
Employee *---1 Employee (buhr)         (from EC)

EmailTemplate  (scope: SYSTEM_DEFAULT | TD_ADMIN | BUHR:<bu_id>)
EmailLog
AuditLog
LeaderSample  (bu-tagged, TD Admin curated)
```

### 4.2 Entities and fields

#### 4.2.1 `employees` (EC mirror, read-only to the application)

| Field | Type | Notes |
|---|---|---|
| `employee_id` | string, PK | EC employee ID. Primary key across the whole system. |
| `full_name` | string | |
| `email` | string | Must be a `bajajauto.co.in` address |
| `manager_employee_id` | string, FK nullable | Null triggers a TD Admin data-gap flag |
| `manager_email` | string, nullable | |
| `buhr_employee_id` | string, FK nullable | Null triggers a TD Admin data-gap flag |
| `buhr_email` | string, nullable | |
| `bu` | string | Drives BUHR scoping and leader-sample filtering |
| `function` | string | |
| `department` | string | Filter dimension |
| `designation` | string | |
| `bu_head_employee_id` | string, nullable | Filter dimension on dashboards |
| `hire_date` | date | Drives cycle eligibility |
| `is_active` | boolean | False removes from dashboards, retains submitted SDP |
| `last_synced_at` | timestamp | |
| `sync_gaps` | string[] | For example `["MANAGER_NOT_MAPPED"]` |

#### 4.2.2 `cycles`

| Field | Type | Notes |
|---|---|---|
| `cycle_id` | uuid, PK | |
| `label` | string | For example "2026-27" |
| `start_date` | date | Employee access opens |
| `hire_date_cutoff` | date | Employees hired after this are excluded |
| `q1_window_start` / `q1_window_end` | date | Q1 check-in window |
| `mid_year_cutoff` | date | |
| `q2_window_start` / `q2_window_end` | date | |
| `year_end_cutoff` | date | |
| `status` | enum | `DRAFT`, `ACTIVE`, `CLOSED` |
| `is_reopened` | boolean | Set when TD Admin reopens for edits |

Exactly one cycle may be `ACTIVE` at a time.

#### 4.2.3 `sdps`

| Field | Type | Notes |
|---|---|---|
| `sdp_id` | uuid, PK | |
| `employee_id` | FK | |
| `cycle_id` | FK | Unique together with `employee_id` |
| `status` | enum | See Section 7.1 |
| `sharing_scope` | enum, nullable | `FULL` or `GOALS_ONLY`. Null until submission. |
| `submitted_at` | timestamp, nullable | |
| `conversation_confirmed_at` | timestamp, nullable | |
| `manager_employee_id_snapshot` | string | Manager at time of submission, for audit stability |
| `last_saved_at` | timestamp | Powers the "Last saved at HH:MM" indicator |
| `created_at` / `updated_at` | timestamp | |

#### 4.2.4 `reflections`

One row per SDP. Storing as discrete columns (not a generic key-value table) keeps validation and the Letter composer simple.

| Field | Type | Notes |
|---|---|---|
| `sdp_id` | FK, PK | |
| `q1_words` | string[] | Three-word chips, min 1 |
| `q1_text` | text, nullable | Optional free text accompanying the chips |
| `q2_text` | text | Min 80 chars to continue |
| `q3_text` | text | Min 80 chars to continue |
| `q4_text` | text | Min 80 chars to continue |
| `q5_text` | text | Min 80 chars to continue |
| `q6_text` | text | Min 80 chars before submission |

#### 4.2.5 `goals`

| Field | Type | Notes |
|---|---|---|
| `goal_id` | uuid, PK | |
| `sdp_id` | FK | Max 3 per SDP, min 1 at submission |
| `sort_order` | int | 1 to 3 |
| `title` | string | Required |
| `domain` | enum | `FUNCTIONAL`, `BEHAVIOURAL`, `LEADERSHIP`. Required. |
| `why_it_matters` | text | Required |
| `grown_when` | text | "How I will know I have grown". Required. |
| `action_do` | text | Required |
| `action_learn` | text | Required |
| `action_connect` | text | Required |
| `support_needed` | text | Required |

#### 4.2.6 `check_ins`

| Field | Type | Notes |
|---|---|---|
| `check_in_id` | uuid, PK | |
| `sdp_id` | FK | |
| `goal_id` | FK, nullable | Null means a check-in level note across all goals |
| `period` | enum | `Q1`, `MID_YEAR`, `Q2`, `YEAR_END` |
| `progress_note` | text | |
| `status` | enum | `NOT_STARTED`, `IN_PROGRESS`, `ON_TRACK`, `AT_RISK`, `ACHIEVED` |
| `submitted_at` | timestamp | Date-stamped, drives the timeline visual and the email trigger |

#### 4.2.7 `manager_feedback`

| Field | Type | Notes |
|---|---|---|
| `feedback_id` | uuid, PK | |
| `sdp_id` | FK | |
| `type` | enum | `PLAN`, `MID_YEAR`, `YEAR_END`. Unique per SDP per type. |
| `author_employee_id` | string | The manager |
| `body` | text | |
| `shared_at` | timestamp, nullable | Null means draft, not visible to employee |

Once `shared_at` is set the record is immutable. See FR-MGR-030.

#### 4.2.8 `support_needs`

| Field | Type | Notes |
|---|---|---|
| `support_need_id` | uuid, PK | |
| `sdp_id` | FK | |
| `goal_id` | FK, nullable | |
| `body` | text | |
| `status` | enum | `OPEN`, `ACTIONED` |
| `actioned_by` / `actioned_at` | nullable | Manager who marked it |
| `created_at` / `updated_at` | timestamp | Updates re-trigger the manager email |

#### 4.2.9 `journal_entries`

| Field | Type | Notes |
|---|---|---|
| `entry_id` | uuid, PK | |
| `employee_id` | FK | **Not** linked to `sdp_id`. Journal outlives cycles. |
| `body` | text | |
| `created_at` | timestamp | Immutable, displayed as `DD MMM YYYY · HH:MM` |
| `updated_at` | timestamp | |
| `deleted_at` | timestamp, nullable | Soft delete |

**Hard rule:** no API route, export, report, payload or admin screen may ever return a `journal_entries` row for an `employee_id` other than the authenticated caller's own. This is enforced at the data-access layer, not the controller.

#### 4.2.10 `email_templates`

| Field | Type | Notes |
|---|---|---|
| `template_id` | uuid, PK | |
| `key` | string | For example `NUDGE_SDP_SUBMISSION`, `AUTO_SDP_SUBMITTED` |
| `scope` | enum | `SYSTEM_DEFAULT`, `TD_ADMIN`, `BUHR` |
| `bu_id` | string, nullable | Set only when scope is `BUHR` |
| `subject` | string | |
| `body_html` | text | |
| `updated_by` / `updated_at` | | |

Resolution order for a BUHR nudge: `BUHR:<bu>` override, then `SYSTEM_DEFAULT`.

#### 4.2.11 `email_log`

`email_id`, `template_key`, `to_email`, `from_email`, `subject`, `sdp_id` nullable, `triggered_by` (SYSTEM or employee_id), `status` (`QUEUED`, `SENT`, `BOUNCED`, `FAILED`), `provider_message_id`, `sent_at`, `error`.

#### 4.2.12 `audit_log`

`audit_id`, `actor_employee_id`, `actor_role`, `action` (enum, see 4.3), `entity_type`, `entity_id`, `subject_employee_id`, `metadata` (jsonb), `ip_address`, `created_at`.

Append only. No update or delete path exists.

#### 4.2.13 `leader_samples`

`sample_id`, `leader_name`, `leader_designation`, `bu` (nullable means org-wide), `content_html`, `sort_order`, `is_published`.

### 4.3 Audited actions

`SDP_SUBMITTED`, `SHARING_SCOPE_SET`, `CONVERSATION_CONFIRMED`, `CHECKIN_SUBMITTED`, `FEEDBACK_SHARED`, `SUPPORT_NEED_ACTIONED`, `TEMPLATE_EDITED`, `TEMPLATE_RESET`, `NUDGE_SENT`, `BULK_ANNOUNCEMENT_SENT`, `CYCLE_CONFIGURED`, `CYCLE_REOPENED`, `EXPORT_GENERATED`, `EC_SYNC_COMPLETED`, `EC_SYNC_GAP_FLAGGED`, `DC_SYNC_SENT`, `DC_SYNC_FAILED`, `EMAIL_BOUNCED`.

Journal actions are **not** audited beyond a bare `JOURNAL_ENTRY_COUNT` metric, and never with content.

---

## 5. Employee Central Integration

### 5.1 Sync contract

| Aspect | Specification |
|---|---|
| Direction | One way only, EC to SDP. The SDP tool never writes to EC. |
| Mechanism | Scheduled pull from the EC API (SuccessFactors OData v2 assumed, to confirm) |
| Frequency | Nightly full sync, plus an on-demand trigger available to TD Admin |
| Auth | Service account credentials held in the secrets manager, never in code or config files |
| Idempotency | Upsert on `employee_id`. Re-running a sync must be safe. |
| Volume assumption | See open item OQ-14 |

### 5.2 Synced fields

Employee ID, full name, official email, manager employee ID, manager email, BUHR employee ID, BUHR email, BU, function, department, designation, hire date, active/inactive flag. BU Head mapping is needed for the dashboard filter and is assumed to come from the same source (see OQ-03).

### 5.3 Sync rules

- **FR-EC-001** Employees with `hire_date` after the cycle's `hire_date_cutoff` are excluded from the current cycle. They appear in no dashboard, receive no emails, and see an "you will join the next cycle" message if they reach the tool.
- **FR-EC-002** When an employee becomes inactive, they are removed from all dashboards immediately. Any submitted SDP, goals, check-ins and feedback are retained in the database and remain in the audit trail. Their journal is retained but inaccessible.
- **FR-EC-003** A missing required EC field never blocks the employee. The tool flags a data gap to TD Admin (for example "Manager not mapped") and lets the employee proceed with their reflection. Submission-dependent behaviour degrades gracefully: with no manager mapped, the SDP can still be submitted, but the manager notification is queued rather than sent and the gap is surfaced on the TD Admin dashboard.
- **FR-EC-004** Role assignment is derived, never manual. Manager role is granted if at least one active employee maps to the user as manager. BUHR role is granted if at least one active employee maps to the user as BUHR. TD Admin is the only manually granted role (see OQ-05).
- **FR-EC-005** A manager change mid-cycle updates the live manager mapping for future actions, but the `manager_employee_id_snapshot` on a submitted SDP is preserved for audit. Feedback already shared remains attached to the original author. The new manager gains access to the reportee's shared SDP content from the point of the mapping change.
- **FR-EC-006** Every sync run writes an `EC_SYNC_COMPLETED` audit entry with counts of records created, updated, deactivated and flagged.
- **FR-EC-007** If a sync run fails or returns fewer than 50% of the previous run's record count, the sync aborts without applying changes and alerts TD Admin. This guards against a partial EC response wiping the dashboard.

---

## 6. Authentication, Authorisation, Hosting

### 6.1 Hosting and access

- **FR-SYS-001** The application is hosted on Bajaj Auto internal cloud or an approved web host, on the sub-domain `sdp.bajajauto.co.in` (final URL to be confirmed, OQ-01).
- **FR-SYS-002** All traffic is HTTPS only, HSTS enabled, HTTP redirected.
- **FR-SYS-003** Access is via Bajaj Auto SSO. There is no separate username or password, no local account creation, and no password reset flow anywhere in the product.
- **FR-SYS-004** Supported browsers: latest two major versions of Chrome, Edge, Safari and Firefox on desktop. Mobile responsive per Section 16.
- **FR-SYS-005** An unsupported or very old browser sees a non-blocking banner recommending an upgrade.

### 6.2 Session and role handling

- **FR-SYS-010** On successful SSO assertion, the application resolves the user to an `employee_id`, loads their derived roles, and establishes a server-side session.
- **FR-SYS-011** If the authenticated identity does not resolve to an active EC record, the user sees a clear "your access is being set up, please contact TD" page. No blank screen, no error stack.
- **FR-SYS-012** Session idle timeout of 8 hours, absolute timeout of 24 hours (see OQ-02 for confirmation against Bajaj policy). On expiry the user is silently re-authenticated via SSO where possible. **Any unsaved input must survive re-authentication.**
- **FR-SYS-013** Every authorisation decision is enforced server side. The UI hides what a role cannot see; the API refuses it. Any API response that could contain another person's reflection or journal content must pass an explicit ownership or sharing-scope check.
- **FR-SYS-014** Deep links from emails carry the target route. An unauthenticated user hitting a deep link is sent through SSO and then landed on the intended page, not the home page.

---

## 7. Lifecycle and State Machine

### 7.1 SDP status

```
NOT_STARTED
    | employee opens Reflect and saves any content
    v
DRAFT  <-------------------------------+
    | employee clicks Submit plan,     | TD Admin reopens cycle
    | passes validation, chooses       | (exceptional, audited)
    | sharing scope                    |
    v                                  |
SUBMITTED --------------------------->-+
    | employee clicks
    | "Confirm conversation + unlock"
    v
CONVERSATION_CONFIRMED
    | (manager feedback now unlocked; check-in tracking runs in parallel)
    v
IN_PROGRESS  (Q1 / Mid-Year / Q2 / Year-End check-ins occur here)
    | cycle year-end cut-off passes
    v
CLOSED  (read only; Letter and PDF remain available)
```

**Rules**

- **FR-LC-001** In `DRAFT`, all reflection and goal content is freely editable.
- **FR-LC-002** On transition to `SUBMITTED`, reflection (Q1 to Q6) becomes read only for the employee. Goals become read only. Sharing scope becomes immutable.
- **FR-LC-003** Manager feedback of type `PLAN` cannot be shared until the SDP reaches `CONVERSATION_CONFIRMED`. The manager may draft it earlier; the Share button is disabled with an explanatory tooltip.
- **FR-LC-004** Check-ins, support needs, Journal entries and the Letter remain writable (Journal and check-ins) or refreshable (Letter) after submission.
- **FR-LC-005** Only TD Admin can reopen a cycle or an individual SDP. Reopening is audited, notifies the employee, and re-triggers the DC Tool sync on the next submit.
- **FR-LC-006** In `CLOSED`, everything is read only except the Journal, which is never cycle bound.

### 7.2 The nine milestones

These nine milestones are the spine of the product. They are the nine trackable columns on the BUHR and TD Admin dashboards, the nine BUHR nudge templates, and the timeline on the employee dashboard. Keep the enum identical everywhere.

| # | Milestone key | Actor | Completed when | Dashboard column |
|---|---|---|---|---|
| 1 | `SDP_SUBMITTED` | Employee | Submit plan succeeds | SDP |
| 2 | `GROWTH_CONVERSATION` | Employee | "Confirm conversation + unlock" clicked | Growth Conv |
| 3 | `MGR_PLAN_FEEDBACK` | Manager | Plan feedback shared | Mgr Plan Fb |
| 4 | `Q1_CHECKIN` | Employee | Q1 check-in submitted | Q1 |
| 5 | `MID_YEAR_CHECKIN` | Employee | Mid-year check-in submitted | Mid-Year |
| 6 | `MGR_MID_FEEDBACK` | Manager | Mid-year feedback shared | Mgr Mid Fb |
| 7 | `Q2_CHECKIN` | Employee | Q2 check-in submitted | Q2 |
| 8 | `YEAR_END_CHECKIN` | Employee | Year-end check-in submitted | Year-End |
| 9 | `MGR_YEAR_FEEDBACK` | Manager | Year-end feedback shared | Mgr Year Fb |

**Milestone display states**

| State | Chip | Meaning |
|---|---|---|
| `DONE` | Green "Done" with date | Completed |
| `PENDING` | Light red "Pending" | Due now or overdue and not completed |
| `NOT_DUE` | Grey "-" | The cycle configuration says this window has not opened yet |

- **FR-LC-010** A milestone is `NOT_DUE` until its window opens per cycle configuration, and until its prerequisite milestone is `DONE`. For example `MGR_PLAN_FEEDBACK` is `NOT_DUE` while `GROWTH_CONVERSATION` is incomplete, then becomes `PENDING`.
- **FR-LC-011** Nudges are only offered on `PENDING` cells. Never on `DONE` or `NOT_DUE`.

---

## 8. Employee Experience

Route map:

| Route | Screen | Availability |
|---|---|---|
| `/` | Landing / Home | Always |
| `/reflect` | Reflect (Q1 to Q5) | Always, read only after submit |
| `/vision` | Vision (Q6) | Always, read only after submit |
| `/goals` | Goals | Always, read only after submit |
| `/submit` | Review and Submit | After submission attempt |
| `/dashboard` | Dashboard / Track My Goals | After submission |
| `/toolkit` | Support Toolkit | Always |
| `/journal` | My Journal | Always (persistent nav tab) |
| `/letter` | My Letter | Always (persistent nav tab) |

### 8.1 Global shell

- **FR-EMP-001** A persistent top bar carries: Bajaj Auto logo (left), the label "Self Development Plan 2026-27" (centre or adjacent to logo), and a user-menu pill (right) showing the employee's name and initials.
- **FR-EMP-002** The user-menu pill opens a small menu with: name, designation, BU, and a Sign out action.
- **FR-EMP-003** The navigation bar always exposes My Journal and My Letter, regardless of position in the flow. These are standalone tabs, not part of the Toolkit grid.
- **FR-EMP-004** Managers see an additional "My Team" nav item. BUHR and TD Admin see an additional dashboard nav item. Roles are additive; a person can see several.
- **FR-EMP-005** Below 900px the nav collapses to a hamburger menu.

### 8.2 Landing / Home (`/`)

Purpose: set context and orient the employee before they start writing.

- **FR-EMP-010** A hero band in deep navy (`#0E3F87`) carries the opening message with a serif headline.
- **FR-EMP-011** Four chapter cards are displayed in monochrome blue stepping (four progressively darker tints, not four different colours): "Who I am", "What drives me", "Where I stand", "Who I want to become".
- **FR-EMP-012** Each chapter card shows its completion state derived from the underlying questions (chapter 1 maps to Q1 to Q2, chapter 2 to Q3, chapter 3 to Q4 to Q5, chapter 4 to Q6, see OQ-06 to confirm the mapping).
- **FR-EMP-013** A "Sample Leader SDPs" carousel appears, filtered by the employee's BU. See Section 14.
- **FR-EMP-014** A tool walkthrough video placeholder is present. Until the video is supplied it renders as a styled placeholder card, not a broken embed.
- **FR-EMP-015** A primary "Begin reflection" call to action navigates to `/reflect`. After a draft exists, the label changes to "Continue reflection". After submission it changes to "View my plan".

### 8.3 Reflect (`/reflect`, Q1 to Q5)

- **FR-EMP-020** The page presents five question cards in sequence.

| Q | Prompt | Input | Response Guide | Min |
|---|---|---|---|---|
| Q1 | In three words, I would describe myself as... | Word chips plus a free-text field | No (deliberate) | 1 word |
| Q2 | The qualities I want to be known for at work are... | Free text | Yes | 80 chars |
| Q3 | The work I genuinely enjoy doing is... | Free text | Yes | 80 chars |
| Q4 | Looking back, what moments best reflect who you are at your best? | Free text | Yes | 80 chars |
| Q5 | Looking back, where do you still have room to grow? | Free text | Yes | 80 chars |

- **FR-EMP-021** Q1 uses selectable word chips. The employee may also type their own words. Behaviour details in OQ-07 (chip source list, whether exactly three is enforced). Baseline: minimum 1 word, soft guidance toward three, free-text field always available alongside.
- **FR-EMP-022** Each question card carries a collapsable pill: "Not sure where to start? Ask yourself..." expanding to three to five priming questions specific to that question. Expanded state is independent per question and preserved across page reloads within the same session.
- **FR-EMP-023** Q2 to Q5 each carry a "Response Guide" pill at the top right of the question card. See Section 12.5.
- **FR-EMP-024** An "LCFW Overview" pill sits at the top of the page and opens the LCFW modal.
- **FR-EMP-025** A "Save Draft" button and a "Last saved at HH:MM" indicator are visible.
- **FR-EMP-026** A Continue arrow navigates to `/vision`. Clicking Continue runs hard validation on Q1 to Q5. See Section 12.2.
- **FR-EMP-027** A compact progress indicator shows "x of 6 reflection questions".

### 8.4 Vision (`/vision`, Q6)

- **FR-EMP-030** A reflection-so-far visual at the top shows three chapters done plus chapter four active.
- **FR-EMP-031** Q6: "Describe the version of yourself you want to become in the next 3 years..." Free text, minimum 80 characters, with a Response Guide.
- **FR-EMP-032** Save Draft button and last-saved indicator present. Continue arrow navigates to `/goals`.

### 8.5 Goals (`/goals`)

Purpose: translate reflection into one to three concrete development goals.

- **FR-EMP-040** A "Review before deciding" pill prompts the employee to re-read their Q1 to Q6 answers before committing. Clicking it opens a read-only summary modal of their own reflection answers.
- **FR-EMP-041** The employee can add between one and three goal cards. Add is disabled at three. Remove is disabled at one (once at least one exists).
- **FR-EMP-042** Each goal card captures: title, domain (Functional / Behavioural / Leadership), why it matters, how I will know I have grown, action plan split into three labelled fields (Do, Learn, Connect), and support I need.
- **FR-EMP-043** Domain is a single-select of three blue-tinted pills. Exactly one domain per goal is required.
- **FR-EMP-044** A right-side reference panel contains three elements, always visible on desktop and collapsed into an accordion below the goals on mobile:
  - Goal domain guide: three blue-tint rows explaining Functional, Behavioural, Leadership.
  - "Sample Goals for Goal Setting": three buttons, one per domain, each opening a focused single-domain modal (Section 12.10).
  - Action plan templates accordion explaining the Do / Learn / Connect framework with fill-in patterns.
- **FR-EMP-045** An "LCFW Overview" pill is present at the top of this page as well.
- **FR-EMP-046** The progress indicator shows "y of 3 goals".
- **FR-EMP-047** A "Submit plan" button at the bottom runs full validation across Q1 to Q6 and all goals. On success it opens the sharing-scope modal (Section 12.6) rather than submitting immediately.

### 8.6 Review and Submit (`/submit`)

- **FR-EMP-050** On successful submission the page shows "Your draft plan is submitted".
- **FR-EMP-051** A navy nudge band reads "Your next step: prepare for a growth conversation".
- **FR-EMP-052** A Growth Conversation Checklist card is clickable and opens the interactive 21-item checklist modal **on top of this page**. It must not navigate away. Checklist state persists per employee per cycle.
- **FR-EMP-053** A "Confirm conversation + unlock" button records `conversation_confirmed_at`, completes milestone `GROWTH_CONVERSATION`, unlocks manager feedback sharing, and triggers an email to the manager.
- **FR-EMP-054** The confirm action requires a confirmation dialog ("Have you had your growth conversation with {manager}?") because it is not reversible by the employee.
- **FR-EMP-055** After confirmation, the page shows the confirmed state with a date stamp and a link onward to the Dashboard.

### 8.7 Dashboard / Track My Goals (`/dashboard`)

Active throughout the year after submission.

- **FR-EMP-060** A timeline visual at the top shows the nine milestones with completion state and date stamps.
- **FR-EMP-061** Tabs: Track My Goals, Q1, Mid-Year, Q2, Year-End.
- **FR-EMP-062** The "Track My Goals" tab lists the submitted goals in read-only form with their current status and latest progress note.
- **FR-EMP-063** Each period tab (Q1, Mid-Year, Q2, Year-End) presents, per goal: a progress-note textarea, a status select, and a support-need field. A single "Submit check-in" action per period.
- **FR-EMP-064** A period tab is locked as `NOT_DUE` until its window opens per cycle configuration, showing the window dates.
- **FR-EMP-065** On submitting a check-in, the entry is date stamped, becomes read only, completes the corresponding milestone, and triggers a manager email.
- **FR-EMP-066** Adding or updating a support need triggers a manager email immediately, independently of check-in submission.
- **FR-EMP-067** Manager feedback that has been shared appears inline on this page in read-only form with the share date, under the corresponding period.
- **FR-EMP-068** Amending a submitted check-in is not permitted in v1. The employee may add a support need at any time. See OQ-08.

### 8.8 Support Toolkit (`/toolkit`)

A reference area, not a workflow page.

- **FR-EMP-070** Four tiles in a 2x2 grid, no icons.

| Position | Tile | Behaviour |
|---|---|---|
| Top-left | FAQ Document | Opens FAQ modal, 16 questions across 5 sections |
| Top-right | Growth Conversation Checklist | Opens the same interactive 21-item checklist modal used on `/submit` |
| Bottom-left | Sample Responses | Static reference content (content to be supplied) |
| Bottom-right | Action Plan Guide | Explains the Do / Learn / Connect framework (content to be supplied) |

- **FR-EMP-071** Tiles whose content has not yet been supplied render as a styled "coming soon" state, never as an empty modal.
- **FR-EMP-072** The Toolkit is accessible at every stage including before starting and after cycle close.

### 8.9 My Journal (`/journal`)

- **FR-EMP-080** A private freeform notes area, accessible from the navigation bar at all times, at every stage of the flow.
- **FR-EMP-081** A "+ New entry" button creates a fresh entry and focuses its body field.
- **FR-EMP-082** Each entry displays an auto-generated stamp `DD MMM YYYY · HH:MM` at the top. The employee cannot edit the stamp.
- **FR-EMP-083** Each entry has a free-text body, a "Save note" button and a "Delete" button.
- **FR-EMP-084** Entries auto-save on pause, debounced approximately 1.5 seconds after the last keystroke. The "Save note" button gives explicit confirmation feedback.
- **FR-EMP-085** Delete asks for confirmation and performs a soft delete.
- **FR-EMP-086** Entries are listed newest first.
- **FR-EMP-087** Entries persist across session end, browser close and device switch, stored against the employee ID.
- **FR-EMP-088 (privacy, non-negotiable)** Journal entries are never shared with the manager, BUHR or TD Admin under any circumstances. They do not appear in any other view, any export, the Letter, the PDF, the DC Tool payload, or any email content. There is no admin override and no support tool that can read them.

### 8.10 My Letter (`/letter`)

- **FR-EMP-090** A composed narrative letter, auto-built from Q1 to Q6 plus goals plus action plans. The employee does not write the letter; it is generated from their own words.
- **FR-EMP-091** Accessible from the navigation bar at all times.
- **FR-EMP-092** The letter auto-refreshes whenever the underlying reflection or goals change. No manual regenerate step.
- **FR-EMP-093** Before there is enough content, the Letter shows a partial state indicating which chapters are still to be written, rather than an empty page.
- **FR-EMP-094** A "Download as PDF" button generates a PDF that mirrors the on-screen letter, with the Bajaj header, brand colours and the employee's name.
- **FR-EMP-095** The Letter is positioned in copy as the artefact the employee carries forward into next year's reflection.
- **FR-EMP-096** Letter composition is deterministic template-based text assembly. See OQ-09 on whether any generative summarisation is wanted; the baseline assumption is no.

---

## 9. Manager Experience

The manager sees everything an employee sees for their own SDP, plus a "My Team" tab.

### 9.1 My Team (`/team`)

- **FR-MGR-001** Lists direct reportees (from EC manager mapping) with current SDP milestone status.
- **FR-MGR-002** Per reportee row: name, role/designation, SDP scope shared (Full SDP or Goals only), submission date, last activity date, and compact milestone chips.
- **FR-MGR-003** Rows are sortable by name, submission date and last activity. A text search filters the list.
- **FR-MGR-004** A summary strip at the top shows counts: submitted, pending submission, awaiting my feedback, open support requests.
- **FR-MGR-005** Clicking a row opens the reportee detail page.
- **FR-MGR-006** Only direct reportees appear. No skip-level visibility in v1 (see OQ-10).

### 9.2 Reportee detail (`/team/:employeeId`)

- **FR-MGR-010** The top of the page shows the reportee's shared SDP content according to their sharing scope:
  - `FULL`: full reflection (Q1 to Q6) plus goals plus action plans.
  - `GOALS_ONLY`: goals and action plans only. The reflection section is absent, not blurred or teased.
- **FR-MGR-011** The scope is stated plainly on the page so the manager understands what they are and are not seeing, without implying the reportee withheld something.
- **FR-MGR-012** Journal entries are never present on this page in any form.
- **FR-MGR-013** Three feedback sections appear in this fixed order: Initial Plan Feedback, Mid-Year Feedback, Year-End Feedback.
- **FR-MGR-014** Each feedback section contains a textarea for the manager's comments and a "Share with {reportee first name}" button.
- **FR-MGR-015** A feedback section is disabled with an explanatory message until its prerequisite is met: Plan feedback requires `GROWTH_CONVERSATION` done, Mid-Year feedback requires `MID_YEAR_CHECKIN` done, Year-End feedback requires `YEAR_END_CHECKIN` done.
- **FR-MGR-016** Draft feedback autosaves and is visible only to the manager until shared.
- **FR-MGR-017** Status text reads "Not yet shared with {name}" and flips to "✓ Shared with {name} on {date}" once shared.
- **FR-MGR-018** A "Support requests" section lists items the reportee flagged from their Dashboard, with a "Mark as actioned" control per item. Actioned items show who actioned them and when.
- **FR-MGR-019** The manager can see the reportee's check-in progress notes and statuses per period.
- **FR-MGR-030 (locking)** Once shared, a feedback section is locked and immutable. An email triggers to the reportee. If a manager needs to correct shared feedback, the only path is a TD Admin unlock, which is audited. This is deliberate: shared coaching feedback is a record.

---

## 10. BUHR Experience

### 10.1 SDP Tracking Dashboard (`/hr`)

- **FR-HR-001** The dashboard is scoped to the BUs for which the user is the mapped BUHR. No cross-BU data is returned by the API for this role, regardless of request parameters.
- **FR-HR-002** A deep-navy banner sits at the top with the title "SDP Tracking Dashboard" and the BU name.
- **FR-HR-003** A filter bar provides: free-text employee search, Manager dropdown, BU Head dropdown, Department dropdown. Filters combine with AND. Active filters are visible as removable chips.
- **FR-HR-004** A summary strip shows: total eligible employees, submitted count and percentage, growth conversations done, check-ins due now, overdue items.
- **FR-HR-005** A toolbar provides "Email templates" (opens the templates modal) and "Export to Excel".
- **FR-HR-006** BUHR never sees reflection content, goal content, check-in note text, feedback text, or journal content. Only milestone status and metadata. This is enforced by the API returning a status-only projection, not by the front end omitting fields.

### 10.2 Tracking table

- **FR-HR-010** Eleven columns in this order: Employee, Manager, SDP, Growth Conv, Mgr Plan Fb, Q1, Mid-Year, Mgr Mid Fb, Q2, Year-End, Mgr Year Fb.
- **FR-HR-011** The Employee column is sticky on the left during horizontal scroll.
- **FR-HR-012** Cell chips: green "Done" with date, light red "Pending", grey "-" for not yet due.
- **FR-HR-013** Every `PENDING` cell carries a "Send Nudge" link. Clicking sends the templated email for that milestone from the BUHR's own email ID.
- **FR-HR-014** After a nudge is sent, the link shows "Nudged {date}" and is rate limited (see FR-HR-016).
- **FR-HR-015** The SDP cell carries a scope tag: green "Full" if the full SDP was shared, red "Goals only" if only goals were shared. This tag is metadata, not content, and is therefore permitted for this role.
- **FR-HR-016** A given employee cannot be nudged for the same milestone more than once in 48 hours. The link is disabled with a tooltip stating when the next nudge is possible.
- **FR-HR-017** A "Nudge all pending" bulk action is available per column, with a confirmation dialog stating the recipient count.
- **FR-HR-018** The table paginates or virtualises above 100 rows. Sorting is available on Employee, Manager and Department.

### 10.3 Export to Excel

- **FR-HR-020** Exports the current filtered view as CSV (or XLSX, see OQ-11), one row per employee, columns matching the tracking table plus employee ID, email, BU, department, designation, manager name and scope tag.
- **FR-HR-021** Date-stamped filenames: `SDP_Tracking_{BU}_{YYYYMMDD_HHMM}.csv`.
- **FR-HR-022** Exports contain no reflection, goal, feedback, check-in note or journal content.
- **FR-HR-023** Every export writes an `EXPORT_GENERATED` audit entry recording actor, filters applied and row count.

### 10.4 BUHR email templates modal

- **FR-HR-030** BUHR can edit nine nudge templates, one per milestone: SDP submission, Growth conversation, Mgr plan feedback, Q1 check-in, Mid-year, Mgr mid feedback, Q2 check-in, Year-end, Mgr year feedback.
- **FR-HR-031** Supported placeholders: `{employee}`, `{manager}`, `{deadline}`. The modal lists available placeholders and inserts them on click.
- **FR-HR-032** Unknown placeholders are rejected on save with a clear error naming the offending token.
- **FR-HR-033** "Save template" persists the change scoped to that BUHR's BU only. "Reset to default" reverts to the system default text.
- **FR-HR-034** A BUHR's edits never affect any other BU. The modal states this explicitly.
- **FR-HR-035** Templates default to TD-Admin-provided wording until a BUHR overrides them.
- **FR-HR-036** A live preview renders the template with sample values.
- **FR-HR-037** Every template edit and reset writes an audit entry.

---

## 11. TD Admin Experience

### 11.1 Org dashboard (`/admin`)

- **FR-TDA-001** Identical dashboard layout to BUHR, scoped to the entire organisation across all BUs.
- **FR-TDA-002** The filter bar carries the same Manager, BU Head and Department dropdowns plus an additional "BU" dropdown.
- **FR-TDA-003** Export to Excel covers the full filtered org view, with the same content restrictions as FR-HR-022.
- **FR-TDA-004** A data-gaps panel lists employees with missing EC fields (for example manager not mapped, BUHR not mapped, missing email) so TD Admin can chase the source system.
- **FR-TDA-005** TD Admin cannot see reflection content, goal content, feedback text, check-in notes or journal entries. Same projection restriction as BUHR.

### 11.2 Cycle configuration (`/admin/cycle`)

- **FR-TDA-010** TD Admin configures: cycle label, cycle start date, Q1 window, mid-year cut-off, Q2 window, year-end cut-off, hire-date cut-off.
- **FR-TDA-011** Dates are validated for logical ordering. Saving an invalid sequence is blocked with a specific message.
- **FR-TDA-012** Changing a cut-off date recalculates milestone `NOT_DUE` / `PENDING` states immediately across all dashboards.
- **FR-TDA-013** A cycle can be created, activated and closed. Only one cycle is `ACTIVE` at a time. Activating a new cycle closes the previous one after a confirmation dialog that states the consequence.
- **FR-TDA-014** TD Admin can reopen a closed cycle or an individual SDP for editing. This is heavily audited and notifies the affected employee.

### 11.3 Auto-trigger email templates (`/admin/templates`)

- **FR-TDA-020** TD Admin owns and edits all ten auto-trigger email templates listed in Section 13.1. These are not editable by BUHR.
- **FR-TDA-021** TD Admin also edits the system-default text for the nine BUHR nudge templates. Changing a default does not overwrite a BU's existing override.
- **FR-TDA-022** All templates support live preview and placeholder validation as per FR-HR-031 and FR-HR-032.
- **FR-TDA-023** TD Admin can send a test email of any template to their own address.

### 11.4 Bulk announcements

- **FR-TDA-030** TD Admin can compose and send a one-off announcement to a filtered audience (whole org, selected BUs, or a milestone-based segment such as "all employees who have not submitted").
- **FR-TDA-031** A confirmation dialog states the exact recipient count before sending.
- **FR-TDA-032** Announcements are queued and throttled, logged in `email_log`, and audited.

### 11.5 Audit log (`/admin/audit`)

- **FR-TDA-040** Displays every audited action (Section 4.3): actor, role, action, subject employee, timestamp, metadata.
- **FR-TDA-041** Filterable by actor, subject, action type and date range. Exportable.
- **FR-TDA-042** The log is append only and cannot be edited or deleted from any interface.
- **FR-TDA-043** Email bounces and DC Tool sync failures are surfaced here.

---

## 12. Cross-Cutting Rules

These rules apply across screens. They are the highest-risk area for regressions and should each have automated test coverage.

### 12.1 Autosave and draft persistence

- **FR-X-001** All text inputs autosave every 15 seconds while the user is on the page and the content is dirty.
- **FR-X-002** All text inputs additionally autosave on blur.
- **FR-X-003** Journal entries use a separate, faster rule: debounced autosave approximately 1.5 seconds after the last keystroke.
- **FR-X-004** All data is stored server side against the employee ID. Browser storage is a resilience buffer only, never the source of truth.
- **FR-X-005** Draft state survives session end, browser close, device switch and network loss. An employee returning days later, on a different machine, finds the draft exactly where they left it.
- **FR-X-006** A "Last saved at HH:MM" indicator is visible on every input page. It reflects the last successful server acknowledgement, not the local attempt.
- **FR-X-007** If a save fails, the indicator changes to a clearly visible unsaved state with a retry action. The application retries with exponential backoff and buffers the content locally in the meantime. The employee is never told "saved" when the server did not confirm.
- **FR-X-008** Attempting to close the tab with unsaved buffered content triggers the browser's native unsaved-changes prompt.
- **FR-X-009** Concurrent edits from two devices resolve last-write-wins per field, with a non-blocking notice if the server version is newer than the version the client loaded.

### 12.2 Character limits and validation

| Field | Rule |
|---|---|
| Q1 (three words) | Minimum 1 word |
| Q2 to Q5 | Minimum 80 characters each, checked on Continue |
| Q6 | Minimum 80 characters, checked before submission |
| Goal title | Required, non-empty |
| Goal domain | Required, exactly one |
| Goal why-it-matters, grown-when, Do, Learn, Connect, support-I-need | Required, non-empty |
| Goal count | Minimum 1, maximum 3 |

- **FR-X-010** Validation is hard, not soft. When minimums are not met on Continue or Submit, an error toast appears and the page scrolls to the first failing field, which is visually marked. There are no soft warnings and no "submit anyway" path.
- **FR-X-011** A live character counter appears on minimum-length fields once the employee starts typing, showing progress toward the minimum. It stops being prominent once satisfied.
- **FR-X-012** Validation runs client side for immediacy and is re-run server side on submit. The server is authoritative.
- **FR-X-013** No maximum character limit is specified in the source document. Baseline: a generous 5000 character soft cap per free-text field with a counter, to protect the database and PDF layout. See OQ-12.

### 12.3 Goal-setting rules

- **FR-X-020** Minimum 1 goal, maximum 3 goals per cycle.
- **FR-X-021** Each goal must be linked to exactly one of the three domains. Using more than one domain across the set of goals is encouraged in copy but not enforced.
- **FR-X-022** Each goal requires all fields listed in 12.2.
- **FR-X-023** Goals are freely editable, addable and removable until submission, then locked.
- **FR-X-024** Deleting a goal with content asks for confirmation.

### 12.4 LCFW framework

- **FR-X-030** The framework comprises four pillars with three sub-dimensions each:

| Pillar | Sub-dimensions |
|---|---|
| Will | Conviction, Integrity, Commitment |
| Energy | Passion, Inspiration, Entrepreneurial |
| Understanding | Intellect, Meticulousness, Laterality |
| Capability | Capacity, Agility, Tenacity |

- **FR-X-031** Accessible via a small "LCFW Overview" pill at the top of the Reflect page and the Goals page.
- **FR-X-032** The modal shows all four pillars and twelve sub-dimensions in monochrome blue, with the four pillars rendered in four progressively darker blue tints, not four different colours.
- **FR-X-033** The LCFW is reference material only in v1. Goals are not tagged to LCFW dimensions. See OQ-13.

### 12.5 Response Guides (Q2 to Q6)

- **FR-X-040** Each of Q2 to Q6 carries a "Response Guide" pill at the top right of its question card.
- **FR-X-041** The modal shows: the question, an optional best-tip callout (present for Q2 and Q5), and two to three worked examples.
- **FR-X-042** Each worked example follows a fixed four-part structure: weak answer, why it is weak, better thinking prompt, strong answer.
- **FR-X-043** Q1 deliberately has no Response Guide. It uses three-word chips, a different style of prompting. Do not add one.

### 12.6 Sharing scope

- **FR-X-050** On clicking Submit plan and passing validation, the employee is presented with exactly two options:
  - **Share full SDP**: the manager sees the reflection (Q1 to Q6) plus goals and action plan.
  - **Share only goals and action plan**: the manager sees only the goals section, not the reflection.
- **FR-X-051** The choice is required. There is no default selection and no skip.
- **FR-X-052** The modal explains in plain language what each option means, and states that the choice cannot be changed after submission.
- **FR-X-053** The choice is per cycle. It can be changed only before submission. After submission it is locked.
- **FR-X-054** BUHR and TD Admin never see reflection content regardless of the choice. They see the scope tag as metadata only.
- **FR-X-055** Server side, the reportee detail API must construct its response from the stored scope. A `GOALS_ONLY` response must not contain reflection fields at any point in the payload, including nested or debug fields.

### 12.7 Collapsable "Not sure where to start" prompts

- **FR-X-060** Below each reflection text area from Q2 onwards, a small expandable pill reads "Not sure where to start? Ask yourself...".
- **FR-X-061** On click it expands to show three to five priming questions specific to that reflection.
- **FR-X-062** Expanded state is independent per question and preserved across page reloads within the same session.

### 12.8 Progress bar

- **FR-X-070** A compact progress indicator is visible on Reflect, Vision and Goals.
- **FR-X-071** It shows steps completed: "x of 6 reflection questions" and "y of 3 goals".
- **FR-X-072** A question counts as complete when it satisfies its minimum validation, not merely when it is non-empty.

### 12.9 Letter PDF download

- **FR-X-080** The Letter can be downloaded as a PDF from the My Letter tab.
- **FR-X-081** The PDF mirrors the on-screen letter with the Bajaj header, brand colours and the employee's name.
- **FR-X-082** Filename convention: `SDP_Letter_{EmployeeName}_{Cycle}.pdf`.
- **FR-X-083** The PDF never contains journal content.
- **FR-X-084** PDF generation happens server side for consistent rendering across browsers.

### 12.10 Sample Goals modals

- **FR-X-090** From the Goals side panel, three buttons (one per domain) open focused single-domain Sample Goals modals.
- **FR-X-091** Each modal lists three to five sample goals with title, why-it-matters and a sample action plan.
- **FR-X-092** Copy explicitly frames these as inspiration, not templates to copy.
- **FR-X-093** There is no "use this goal" action that copies a sample into the employee's plan. This is deliberate.

---

## 13. Email and Notification System

The tool emails users so nobody has to log in speculatively to discover that something happened.

### 13.1 Auto-trigger emails (from the TD Admin email ID)

- **FR-EM-001** Sender: a designated TD Admin email address (for example `learn@bajajauto.co.in`, to be confirmed, OQ-04).
- **FR-EM-002** Templates are owned and editable by TD Admin only.

| Key | Trigger | Recipient |
|---|---|---|
| `AUTO_SDP_SUBMITTED` | Employee submits SDP | Manager |
| `AUTO_PLAN_FEEDBACK_SHARED` | Manager shares Plan Feedback | Employee |
| `AUTO_Q1_CHECKIN` | Employee submits Q1 check-in | Manager |
| `AUTO_MIDYEAR_CHECKIN` | Employee submits Mid-Year check-in | Manager |
| `AUTO_MID_FEEDBACK_SHARED` | Manager shares Mid-Year Feedback | Employee |
| `AUTO_Q2_CHECKIN` | Employee submits Q2 check-in | Manager |
| `AUTO_YEAREND_CHECKIN` | Employee submits Year-End check-in | Manager |
| `AUTO_YEAR_FEEDBACK_SHARED` | Manager shares Year-End Feedback | Employee |
| `AUTO_SUPPORT_NEED` | Employee adds or updates a support need | Manager |
| `AUTO_CONVERSATION_DONE` | Employee marks growth conversation as done | Manager |

- **FR-EM-003** Every email body contains: salutation, what happened, the actor's name, and a "View on the tool" deep link to the specific relevant page.
- **FR-EM-004** Example body for `AUTO_SDP_SUBMITTED`: "Your reportee {employee} has submitted their SDP. Click here to view on the tool."
- **FR-EM-005** Example body for `AUTO_SUPPORT_NEED`: "{employee} has flagged a support need. Click to view."
- **FR-EM-006** Emails never contain reflection content, goal content, feedback text, check-in note text or journal content. They contain the event and a link. This keeps content behind SSO.
- **FR-EM-007** Auto-trigger emails are queued asynchronously. A failure to send never blocks or rolls back the user action that triggered it.
- **FR-EM-008** If the recipient has no mapped email (EC gap), the email is logged as `FAILED` with reason `NO_RECIPIENT` and surfaced on the TD Admin data-gaps panel.

### 13.2 Manual nudges (from the BUHR email ID)

- **FR-EM-010** Triggered manually when a BUHR clicks "Send Nudge" on a pending cell.
- **FR-EM-011** Sender: the BUHR's own email address, so the nudge reads as a personal follow-up (see OQ-15 on whether this is true sender or reply-to, given SPF and DMARC constraints).
- **FR-EM-012** Nine template categories, one per milestone, as listed in Section 10.4.
- **FR-EM-013** Templates default to TD-Admin-provided wording until the BUHR overrides them for their BU.
- **FR-EM-014** Placeholders: `{employee}`, `{manager}`, `{deadline}`. Unresolvable placeholders render as a sensible fallback, never as raw braces in a delivered email.
- **FR-EM-015** Recipient is the person who owes the action: the employee for employee milestones, the manager for manager-feedback milestones.

### 13.3 Delivery

- **FR-EM-020** Emails are sent only to `bajajauto.co.in` addresses synced from EC. Any other recipient domain is rejected at the send layer.
- **FR-EM-021** Deep links route through SSO so the recipient opens straight into the relevant page.
- **FR-EM-022** Bounces and failures are logged and surfaced to TD Admin in the audit log.
- **FR-EM-023** Every send is recorded in `email_log` with template key, recipient, sender, status and timestamp.
- **FR-EM-024** Emails render correctly in Outlook desktop and Outlook web, which are the primary clients. Table-based HTML, inline styles, no external CSS, no web fonts, with a plain-text alternative part.
- **FR-EM-025** Global throttling protects the mail relay during bulk sends and nudge-all actions.
- **FR-EM-026** A non-production environment must never send email to real addresses. All outbound mail in non-production is redirected to a catch-all mailbox.

---

## 14. Sample Leader SDPs (BU-aware)

- **FR-SL-001** On the landing page, a panel shows sample SDPs of senior leaders.
- **FR-SL-002** The employee's BU from EC drives the filter. An Operations employee sees Operations leader SDPs, an R&D employee sees R&D leader SDPs, a Manufacturing employee sees Manufacturing leader SDPs, and so on for every BU.
- **FR-SL-003** Fallback: if no leader SDP is available for the employee's BU, show all leader SDPs across the organisation.
- **FR-SL-004** The panel auto-rotates, one leader SDP visible at a time, advancing approximately every 4 seconds.
- **FR-SL-005** Manual previous and next arrows appear on hover. Auto-rotation pauses on hover, on focus, and permanently once the employee uses a manual control.
- **FR-SL-006** Auto-rotation respects `prefers-reduced-motion` and does not auto-advance when that preference is set.
- **FR-SL-007** TD Admin curates the leader SDP content: which leaders, which BUs, publication state and order.
- **FR-SL-008** If no leader content exists at all, the panel is hidden entirely rather than shown empty.

---

## 15. Visual Design System

Modern Tech Bajaj blue palette. A monochrome blue family throughout.

### 15.1 Colour tokens

```css
/* Brand */
--color-primary:        #1E5FBA;  /* primary accent */
--color-navy:           #0E3F87;  /* landing hero, BUHR banner, modal headers */
--color-blue-medium:    #7BA6E0;
--color-blue-light:     #D6E4F7;
--color-blue-lightest:  #EBF2FA;
--color-canvas:         #F4F7FB;
--color-border:         #D5DCE5;

/* Text */
--color-text-primary:   #0F172A;
--color-text-secondary: #475569;
--color-text-muted:     #64748B;
--color-text-placeholder:#94A3B8;

/* Status */
--color-success-fg:     #15803D;
--color-success-bg:     #E8F5EE;
--color-alert-fg:       #B91C1C;
--color-alert-bg:       #FEE9E9;
```

Status colours are the only non-blue hues in the product. Do not introduce additional accent colours.

### 15.2 Typography

- Sans-serif (Arial or system stack) for body text and all interface chrome.
- Serif accent for hero headlines only.
- Minimal use of icons and emojis. **None in headers.**

### 15.3 Copy rules

- **FR-DS-001** Em-dashes and en-dashes are not used anywhere in product copy, including emails, modals, error messages, tooltips and PDF output. Use commas, colons, or restructure the sentence.
- **FR-DS-002** Copy addresses the employee directly and never implies evaluation, ranking or appraisal.
- **FR-DS-003** Error messages state what to do next, not merely what went wrong.
- **FR-DS-004** Add a lint rule to CI that fails the build if an em-dash or en-dash appears in a copy string file. This rule is easy to state and easy to violate accidentally.

### 15.4 Visual conventions

- **FR-DS-010** LCFW pillars render as four progressively darker blue tints, not four different colours.
- **FR-DS-011** Landing chapter cards render as four progressively darker blue tints.
- **FR-DS-012** Functional / Behavioural / Leadership pills render as three blue tints, consistently across every reference panel where they appear.
- **FR-DS-013** Deep navy is reserved for: the landing hero band, the BUHR and TD Admin banner, and modal headers.
- **FR-DS-014** Green and light red appear only as status chips. Never as decoration.

### 15.5 Component inventory

Build these once and reuse. Every one appears on at least two screens.

| Component | Used on |
|---|---|
| Top bar with user-menu pill | All screens |
| Nav bar with hamburger collapse | All screens |
| Question card (with Response Guide pill and priming prompt) | Reflect, Vision |
| Response Guide modal | Reflect, Vision |
| Priming prompt disclosure | Reflect, Vision |
| LCFW pill and modal | Reflect, Goals |
| Goal card | Goals, Dashboard (read only), Reportee detail |
| Domain pill (three tints) | Goals, Sample Goals modals, Dashboard, Reportee detail |
| Sample Goals modal | Goals |
| Save-draft control with last-saved indicator | Reflect, Vision, Goals, Journal |
| Progress indicator | Reflect, Vision, Goals |
| Status chip (Done / Pending / Not due) | Employee dashboard, My Team, BUHR, TD Admin |
| Scope tag (Full / Goals only) | My Team, BUHR, TD Admin |
| Milestone timeline | Employee dashboard |
| Tracking table with sticky column | BUHR, TD Admin |
| Filter bar | My Team, BUHR, TD Admin |
| Email template editor with preview | BUHR, TD Admin |
| Feedback section with share and lock | Reportee detail |
| Checklist modal (21 items, stateful) | Review and Submit, Toolkit |
| FAQ modal (16 questions, 5 sections) | Toolkit |
| Confirmation dialog | Many |
| Toast | Many |

---

## 16. Responsive and Accessibility

### 16.1 Responsive

- **FR-RS-001** Fully responsive layout with breakpoints at 480px, 768px, 1024px and 1280px.
- **FR-RS-002** The navigation bar collapses into a hamburger menu below 900px.
- **FR-RS-003** Sticky-column tables (BUHR and TD Admin) become horizontally scrollable on mobile, with the employee column remaining pinned.
- **FR-RS-004** Touch targets are a minimum of 44px in height.
- **FR-RS-005** All modals are full screen on mobile, with safe-area padding for notched devices.
- **FR-RS-006** Long text inputs auto-grow on focus to give more typing room on mobile.
- **FR-RS-007** The Goals right-side reference panel collapses below the goal cards as an accordion on screens under 1024px.
- **FR-RS-008** The reflection experience must be genuinely usable on a phone. It is expected that a meaningful share of employees will write at least part of their reflection on mobile.

### 16.2 Accessibility

Baseline target: WCAG 2.1 AA.

- **FR-A11Y-001** All interactive elements are keyboard reachable with a visible focus state.
- **FR-A11Y-002** Modals trap focus, close on Escape, and return focus to the trigger element.
- **FR-A11Y-003** Colour is never the sole carrier of meaning. Status chips carry text labels ("Done", "Pending"), not just colour.
- **FR-A11Y-004** Text contrast meets AA. Note that `#7BA6E0` and lighter tints must not be used for body text on white.
- **FR-A11Y-005** Form fields have associated labels. Validation errors are announced to assistive technology and programmatically linked to their field.
- **FR-A11Y-006** The auto-rotating carousel respects `prefers-reduced-motion` and offers manual controls.
- **FR-A11Y-007** Page titles and heading hierarchy are meaningful on every route.

---

## 17. Downstream Integration

### 17.1 DC Tool sync

- **FR-DC-001** Submitted SDPs feed into the existing DC Tool used after the creation of DC cohorts.
- **FR-DC-002** After Submit Plan succeeds, an outbound payload is sent to the DC Tool API containing:

```json
{
  "employee_id": "string",
  "manager_id": "string",
  "submitted_at": "ISO-8601 timestamp",
  "cycle": "2026-27",
  "goals": [
    {
      "title": "string",
      "domain": "FUNCTIONAL | BEHAVIOURAL | LEADERSHIP",
      "why_it_matters": "string",
      "grown_when": "string",
      "action_plan": { "do": "string", "learn": "string", "connect": "string" }
    }
  ]
}
```

- **FR-DC-003** Reflection content (Q1 to Q6) is never included in the DC Tool payload. Only goals and action plans. Journal content is never included.
- **FR-DC-004** Sync fires on initial submission and on any post-submission goal edit, which occurs only in the edge case where TD Admin has reopened the cycle.
- **FR-DC-005** The send is asynchronous and retried with exponential backoff. A DC Tool outage never blocks or fails the employee's submission.
- **FR-DC-006** Every attempt is logged. Permanent failures surface in the TD Admin audit log with a manual retry action.
- **FR-DC-007** The payload is idempotent on `employee_id` plus `cycle`. Re-sending must not create duplicate records downstream.
- **FR-DC-008** Contract, authentication method and endpoint for the DC Tool API are open (OQ-16).

### 17.2 Bajaj Auto intranet

- **FR-INT-001** A single link from the Bajaj Auto intranet home page deep-links into the SDP tool.
- **FR-INT-002** SSO ensures no further login is required.

---

## 18. Non-Functional Requirements

### 18.1 Performance

| Metric | Target |
|---|---|
| First contentful paint on landing (corporate LAN) | Under 1.5s |
| Route transition | Under 500ms |
| Autosave round trip | Under 800ms p95 |
| Tracking dashboard load, 2000 rows filtered | Under 3s |
| Excel export, 5000 rows | Under 10s, streamed or async with notification |
| Letter PDF generation | Under 5s |

### 18.2 Reliability

- **FR-NFR-001** Target availability 99.5% during business hours across the cycle, with hard peaks expected in the two weeks before each cut-off date.
- **FR-NFR-002** The system must handle a submission spike on the deadline day. Load test at 10x average concurrent users before each cut-off.
- **FR-NFR-003** Daily database backups with point-in-time recovery. Reflection content is not recoverable from anywhere else if lost.
- **FR-NFR-004** Graceful degradation: if the email service or DC Tool is down, core employee flows continue to work.

### 18.3 Security and privacy

- **FR-NFR-010** All authorisation is enforced server side. Front-end route guards are convenience only.
- **FR-NFR-011** Data at rest is encrypted. Data in transit is TLS 1.2 or higher.
- **FR-NFR-012** Journal content is never returned to any caller other than its owner, never logged in application logs, never included in error reports or exception payloads, and never in analytics events.
- **FR-NFR-013** Reflection content is never returned to BUHR or TD Admin roles by any endpoint.
- **FR-NFR-014** Personally identifying content is excluded from client-side error monitoring. Scrub text field values before sending any exception report.
- **FR-NFR-015** Retention: submitted SDPs and audit logs are retained per Bajaj Auto policy (OQ-17). Journal entries are retained while the employee is active; deletion policy on separation to be confirmed (OQ-18).
- **FR-NFR-016** No third-party analytics or tag manager that transmits content field values off the internal network.
- **FR-NFR-017** Rate limiting on all write endpoints and on nudge sending.
- **FR-NFR-018** An automated test in CI asserts that a BUHR-scoped and TD-Admin-scoped API response contains no reflection or journal fields. This is the single most important regression test in the product.

### 18.4 Observability

- **FR-NFR-020** Structured application logging with correlation IDs, excluding content fields.
- **FR-NFR-021** Metrics on autosave failure rate, submission success rate, email delivery rate and DC sync success rate.
- **FR-NFR-022** Alerting on: autosave failure rate above 1%, email bounce rate above 5%, EC sync failure, DC sync backlog.

### 18.5 Analytics

- **FR-NFR-030** Funnel events (no content, IDs and timestamps only): landing viewed, reflection started, each question completed, vision completed, goals started, goal added, submitted, scope chosen, conversation confirmed, each check-in submitted.
- **FR-NFR-031** Engagement events: response guide opened (per question), priming prompt expanded, LCFW opened, sample goals opened, leader SDP viewed, FAQ opened, checklist opened, letter downloaded.
- **FR-NFR-032** These events answer the questions the TD team will actually ask: where do people drop off, which questions are hardest, which supports get used.

---

## 19. Technical Architecture and API Surface

> **Assumption flag.** The source requirements document does not specify a stack. Everything in 19.1 is a recommendation to be confirmed with Bajaj Auto IT before any code is written (OQ-19). The functional requirements above are stack agnostic.

### 19.1 Recommended stack

| Layer | Recommendation | Rationale |
|---|---|---|
| Front end | React 18 with TypeScript, Vite | Component reuse across four role surfaces, strong typing for the milestone and status enums |
| Styling | CSS variables per Section 15.1 plus a utility layer | The palette is fixed and small; tokens should live in one file |
| Routing | React Router | Straightforward route map |
| Server state | TanStack Query | Autosave, retry and stale-state handling are core concerns here |
| Back end | Node with NestJS, or .NET if that matches Bajaj IT standards | Either is fine; consistency with internal ops matters more than the choice |
| Database | PostgreSQL | Relational model, JSONB for audit metadata |
| ORM | Prisma or equivalent, with migrations in version control | |
| Auth | OIDC or SAML against the Bajaj identity provider | Per FR-SYS-003 |
| Email | Corporate SMTP relay, with a queue (BullMQ or equivalent) | Per FR-EM-007 |
| PDF | Server-side headless rendering | Per FR-X-084 |
| Jobs | Scheduled EC sync, email queue, DC sync retry | |

### 19.2 API surface

All routes are authenticated. Authorisation is checked per route against the caller's derived roles.

**Employee**

```
GET    /api/me                         -> profile, roles, cycle, sdp status
GET    /api/sdp                        -> own SDP with reflection and goals
PATCH  /api/sdp/reflection             -> partial autosave of Q1 to Q6
POST   /api/sdp/goals                  -> create goal (max 3 enforced)
PATCH  /api/sdp/goals/:goalId          -> partial autosave
DELETE /api/sdp/goals/:goalId          -> remove goal (min 1 enforced at submit)
POST   /api/sdp/submit                 -> body: { sharing_scope }. Full server validation.
POST   /api/sdp/confirm-conversation   -> completes GROWTH_CONVERSATION
GET    /api/sdp/milestones             -> nine milestones with state and dates
GET    /api/checkins?period=           -> own check-ins
POST   /api/checkins                   -> submit a period check-in
POST   /api/support-needs              -> create or update a support need
GET    /api/letter                     -> composed letter payload
GET    /api/letter/pdf                 -> PDF stream
GET    /api/journal                    -> own entries only, newest first
POST   /api/journal                    -> create entry
PATCH  /api/journal/:entryId           -> debounced autosave
DELETE /api/journal/:entryId           -> soft delete
GET    /api/content/leader-samples     -> BU-filtered with org fallback
GET    /api/content/faq | /checklist | /response-guides | /sample-goals | /lcfw
```

**Manager**

```
GET    /api/team                       -> reportees with milestone chips and scope
GET    /api/team/:employeeId           -> shared SDP content, scope-filtered server side
GET    /api/team/:employeeId/feedback  -> own drafts and shared feedback
PUT    /api/team/:employeeId/feedback/:type   -> save draft (PLAN | MID_YEAR | YEAR_END)
POST   /api/team/:employeeId/feedback/:type/share  -> share and lock, triggers email
POST   /api/team/:employeeId/support-needs/:id/action -> mark actioned
```

**BUHR and TD Admin**

```
GET    /api/hr/tracking?filters        -> status-only projection, BU-scoped for BUHR
GET    /api/hr/export?filters          -> CSV or XLSX stream
POST   /api/hr/nudge                   -> body: { employee_id, milestone }
POST   /api/hr/nudge/bulk              -> body: { milestone, filters }
GET    /api/hr/templates               -> resolved templates for scope
PUT    /api/hr/templates/:key          -> save override
POST   /api/hr/templates/:key/reset    -> revert to system default

GET    /api/admin/cycle | PUT /api/admin/cycle
POST   /api/admin/cycle/reopen         -> body: { employee_id? }
GET    /api/admin/templates | PUT /api/admin/templates/:key
POST   /api/admin/announcements
GET    /api/admin/audit?filters
GET    /api/admin/data-gaps
POST   /api/admin/ec-sync              -> manual trigger
```

### 19.3 Server-side guarantees to implement as middleware, not per route

1. **Journal isolation.** A repository-level guard that refuses any journal query not filtered to the authenticated employee ID.
2. **Content projection by role.** A serialisation layer where BUHR and TD Admin responses are built from a status-only DTO that has no reflection or content fields defined on it at all.
3. **Sharing scope enforcement.** The reportee DTO is selected by scope before serialisation, so `GOALS_ONLY` responses cannot contain reflection fields.
4. **Immutability.** Submitted reflection, submitted goals, shared feedback and submitted check-ins reject writes at the service layer with a clear error, not just a disabled button.
5. **Audit.** A decorator or interceptor that writes the audit entry as part of the same transaction as the action.

---

## 20. Build Guidance

### 20.1 Suggested phasing

| Phase | Scope | Why this order |
|---|---|---|
| **0. Foundations** | Repo, CI, design tokens, component primitives, auth stub, EC sync with seed data, database schema and migrations | Everything else depends on the data model and the palette |
| **1. Employee core** | Landing, Reflect, Vision, Goals, autosave, validation, submit with sharing scope | The heart of the product. Ship nothing before this feels good. |
| **2. Persistent tabs** | Journal, Letter, Letter PDF | Self-contained, high user value, exercises the privacy layer |
| **3. Manager** | My Team, reportee detail, three feedback sections with locking | Unblocks the growth conversation loop |
| **4. Tracking** | BUHR dashboard, tracking table, nudges, templates, export | HR needs this before the first cut-off date |
| **5. TD Admin** | Org dashboard, cycle configuration, auto-trigger templates, audit log, announcements | Cycle config is needed to test milestone windows properly, so stub it early in Phase 0 |
| **6. Year-round** | Employee dashboard, four check-ins, support needs, timeline | Not needed at launch, needed before the Q1 window |
| **7. Integrations and content** | Email system hardening, DC Tool sync, leader samples, FAQ, checklist, response guide content | Content dependencies sit outside engineering |

Note that the email system spans phases. Build the queue and template resolution in Phase 0, wire triggers as each feature lands.

### 20.2 Conventions for implementation

- Milestone keys, status enums, domain enums and sharing-scope values are defined once in a shared types module and imported everywhere. Never re-declare them in a component.
- All product copy lives in a single content module, not inline in components. This makes the em-dash lint rule (FR-DS-004) enforceable and makes TD review possible without reading JSX.
- Static content (FAQ, checklist items, response guides, priming prompts, sample goals, LCFW) is structured data, not hard-coded markup, so it can be edited without a code change.
- Every requirement ID in this document should map to at least one test. Prioritise coverage on Section 12 (cross-cutting), FR-NFR-018 (content projection) and the milestone state machine.
- Seed a realistic fixture set: about 200 employees, 20 managers, 3 BUs, 2 BUHRs, and SDPs at every lifecycle state. Reviewing a dashboard with three rows tells you nothing.

### 20.3 Things that are easy to get wrong

1. Treating sharing scope as a front-end filter. It must be a server-side projection.
2. Letting a failed autosave show "Saved". This destroys trust in the whole product.
3. Rendering the milestone table from live joins on every request at 5000 rows. Materialise or cache milestone status.
4. Building the checklist modal twice because it appears on two screens.
5. Allowing a nudge on a `NOT_DUE` cell because the state check only distinguished done from not-done.
6. Introducing a fifth colour. The monochrome-blue constraint is a deliberate design position, not an oversight.
7. Sending real email from a test environment during a load test.

---

## 21. Open Questions

These must be resolved before or during the phase noted. Do not assume answers.

| ID | Question | Owner | Needed by |
|---|---|---|---|
| OQ-01 | Confirm final sub-domain and hosting environment | Bajaj IT | Phase 0 |
| OQ-02 | Confirm session timeout policy against Bajaj security standards | Bajaj IT Security | Phase 0 |
| OQ-03 | Is BU Head mapping available in EC, or does it need a separate source? The dashboard filter depends on it. | HRIS | Phase 0 |
| OQ-04 | Confirm the TD Admin sender address (`learn@bajajauto.co.in` was indicative) | TD | Phase 0 |
| OQ-05 | How is the TD Admin role granted and revoked? Manual list, AD group, or EC attribute? | TD and IT | Phase 0 |
| OQ-06 | Confirm the mapping of the four landing chapters to Q1 to Q6 | TD | Phase 1 |
| OQ-07 | Q1 word chips: what is the source list, is exactly three enforced, can employees add custom words? | TD | Phase 1 |
| OQ-08 | Can an employee amend a submitted check-in, or is it final? | TD | Phase 6 |
| OQ-09 | Is the Letter purely template-assembled from the employee's own text, or is any generative summarisation wanted? Baseline assumption: template only. | TD | Phase 2 |
| OQ-10 | Should skip-level managers or BU heads have any view of team SDP status? | TD | Phase 3 |
| OQ-11 | Export format: CSV as stated in Section 7.1 of the source, or true XLSX as the button label suggests? | BUHR | Phase 4 |
| OQ-12 | Maximum character limits per free-text field | TD | Phase 1 |
| OQ-13 | Should goals be taggable to LCFW dimensions, or is LCFW reference only? | TD | Phase 1 |
| OQ-14 | Expected employee population in scope, for load sizing | TD | Phase 0 |
| OQ-15 | Can nudges genuinely send from the BUHR's address, or must they send from a system address with reply-to set? Depends on SPF and DMARC configuration. | IT | Phase 4 |
| OQ-16 | DC Tool API contract, endpoint, authentication and error semantics | DC Tool owner | Phase 7 |
| OQ-17 | Data retention period for submitted SDPs and audit logs | HR and Legal | Phase 0 |
| OQ-18 | What happens to journal entries when an employee separates? | HR and Legal | Phase 2 |
| OQ-19 | Confirm technology stack against Bajaj IT standards | Bajaj IT | Before Phase 0 |
| OQ-20 | Hire-date cut-off date for the 2026-27 cycle (marked "to be confirmed" in the source) | TD | Phase 0 |
| OQ-21 | Cycle dates: start, Q1 window, mid-year cut-off, Q2 window, year-end cut-off | TD | Phase 0 |

### 21.1 Content dependencies

Engineering can build the containers, but these need supplying by TD before launch:

| Item | Status in source | Blocks |
|---|---|---|
| Tool walkthrough video | To be shared | Landing page |
| Sample Responses content | To be shared | Toolkit tile |
| Action Plan Guide content | To be shared | Toolkit tile |
| Leader SDP content and BU tagging | To be curated by TD Admin | Landing carousel |
| FAQ: 16 questions across 5 sections | Count known, text not supplied | Toolkit tile |
| Growth Conversation Checklist: 21 items | Count known, text not supplied | Submit page and Toolkit |
| Response Guide worked examples for Q2 to Q6 | Structure known, text not supplied | Reflect and Vision |
| Priming questions, 3 to 5 per question for Q2 onwards | Not supplied | Reflect and Vision |
| Sample goals, 3 to 5 per domain | Not supplied | Goals panel |
| Default email template wording, 10 auto plus 9 nudge | Placeholder text currently | Email system |
| Landing hero copy and chapter card copy | Not supplied | Landing |

Build every one of these as structured data with a visible placeholder state, so a missing content file never produces a broken screen.

---

## 22. Appendix

### 22.1 Requirement ID prefixes

| Prefix | Area |
|---|---|
| `FR-SYS` | Hosting, auth, session |
| `FR-EC` | Employee Central sync |
| `FR-LC` | Lifecycle and milestones |
| `FR-EMP` | Employee screens |
| `FR-MGR` | Manager screens |
| `FR-HR` | BUHR screens |
| `FR-TDA` | TD Admin screens |
| `FR-X` | Cross-cutting rules |
| `FR-EM` | Email and notifications |
| `FR-SL` | Sample leader SDPs |
| `FR-DS` | Design system and copy |
| `FR-RS` | Responsive |
| `FR-A11Y` | Accessibility |
| `FR-DC` | DC Tool integration |
| `FR-INT` | Intranet integration |
| `FR-NFR` | Non-functional |

### 22.2 Enum reference

```ts
type SdpStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'CONVERSATION_CONFIRMED' | 'IN_PROGRESS' | 'CLOSED';
type SharingScope = 'FULL' | 'GOALS_ONLY';
type GoalDomain = 'FUNCTIONAL' | 'BEHAVIOURAL' | 'LEADERSHIP';
type CheckInPeriod = 'Q1' | 'MID_YEAR' | 'Q2' | 'YEAR_END';
type CheckInStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_TRACK' | 'AT_RISK' | 'ACHIEVED';
type FeedbackType = 'PLAN' | 'MID_YEAR' | 'YEAR_END';
type MilestoneState = 'DONE' | 'PENDING' | 'NOT_DUE';
type Milestone =
  | 'SDP_SUBMITTED' | 'GROWTH_CONVERSATION' | 'MGR_PLAN_FEEDBACK'
  | 'Q1_CHECKIN' | 'MID_YEAR_CHECKIN' | 'MGR_MID_FEEDBACK'
  | 'Q2_CHECKIN' | 'YEAR_END_CHECKIN' | 'MGR_YEAR_FEEDBACK';
type Role = 'EMPLOYEE' | 'MANAGER' | 'BUHR' | 'TD_ADMIN';
```

### 22.3 Privacy summary, one table

The most important table in the document. If an implementation decision contradicts this table, the table wins.

| Content | Employee (own) | Manager | BUHR | TD Admin | Export | PDF | DC Tool | Email body |
|---|---|---|---|---|---|---|---|---|
| Reflection Q1 to Q6 | Yes | Only if scope is FULL | Never | Never | Never | Yes (own letter) | Never | Never |
| Goals and action plan | Yes | Always (both scopes) | Never | Never | Never | Yes (own letter) | Yes | Never |
| Check-in notes | Yes | Yes | Never | Never | Never | No | No | Never |
| Support needs | Yes | Yes | Never | Never | Never | No | No | Never |
| Manager feedback | Yes, once shared | Yes (own) | Never | Never | Never | No | No | Never |
| Journal | Yes | **Never** | **Never** | **Never** | **Never** | **Never** | **Never** | **Never** |
| Milestone status and dates | Yes | Yes | Yes | Yes | Yes | No | Timestamp only | Event only |
| Sharing scope tag | Yes | Yes | Yes | Yes | Yes | No | No | No |

### 22.4 Notes on the source document

Two apparent OCR artefacts in the source were interpreted as follows: "submiRed" reads as "submitted" (Section 11.1) and "OperaTons" reads as "Operations" (Section 12). Both are reflected corrected in this PRD.
