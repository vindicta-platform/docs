# Tasks: C4 Domain Modeling

**Input**: Design documents from `/specs/001-c4-domain-modeling/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directory structure and foundational files

- [ ] T001 Create `c4/` directory at repository root
- [ ] T002 [P] Create `c4/README.md` documenting Structurizr CLI version, render instructions, and domain group rationale
- [ ] T003 [P] Create `docs/spikes/` directory with `.gitkeep`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ADR template verification and DSL skeleton

**⚠️ CRITICAL**: The workspace DSL must exist before any user story work begins.

- [ ] T004 Verify ADR template exists at `docs/adr/000-template.md` and contains required sections (Status, Context, Decision, Consequences)
- [ ] T005 Create initial `c4/workspace.dsl` with workspace declaration, model section, software system "Vindicta Platform", and empty views section
- [ ] T006 Define the 6 domain groups as `group` blocks inside the software system: Interface, Core Platform, AI & Simulation, Game Recording, Infrastructure, Governance

**Checkpoint**: Workspace DSL skeleton parseable by Structurizr CLI

---

## Phase 3: User Story 1 — Author the C4 Workspace Model (Priority: P1) 🎯 MVP

**Goal**: All 26 repositories are captured as containers organized into 6 domain groups with inter-group relationships.

**Independent Test**: Run `structurizr-cli export -workspace c4/workspace.dsl -format plantuml` (or open in Structurizr Lite) — all containers appear in correct groups with no parse errors.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Add Interface group containers to `c4/workspace.dsl`: Logi-Slate-UI ("React/TypeScript"), Vindicta-Portal ("JavaScript/Vite/Firebase"), Vindicta-CLI ("Python/Click")
- [ ] T008 [P] [US1] Add Core Platform group containers to `c4/workspace.dsl`: Vindicta-Core ("Python"), Vindicta-API ("Python/FastAPI"), platform-core ("Python")
- [ ] T009 [P] [US1] Add AI & Simulation group containers to `c4/workspace.dsl`: Meta-Oracle ("Python"), Primordia-AI ("Python/DuckDB"), Dice-Engine ("Python"), Entropy-Buffer ("Python")
- [ ] T010 [P] [US1] Add Game Recording group containers to `c4/workspace.dsl`: WARScribe-Core ("Python"), WARScribe-Parser ("Python"), WARScribe-CLI ("Python"), Battle-Transcript-Toolkit ("Python")
- [ ] T011 [P] [US1] Add Infrastructure group containers to `c4/workspace.dsl`: Economy-Engine ("Python"), Agent-Auditor-SDK ("Python"), Quota-Manager ("Python"), Audit-Log-Pro ("Python"), Atomic-Ledger-Py ("Python"), Metered-SaaS-Logic ("Python")
- [ ] T012 [P] [US1] Add Governance group containers to `c4/workspace.dsl`: .specify ("Markdown"), .github ("YAML/Markdown"), Platform-Docs ("Markdown/MkDocs"), Vindicta-Agents ("Markdown")
- [ ] T013 [US1] Add inter-group relationships to `c4/workspace.dsl`: Interface → Core Platform (API calls), Core Platform → AI & Simulation (prediction/evaluation requests), AI & Simulation → Game Recording (game state reads), Infrastructure → Core Platform (rate limiting, billing), Governance → all groups (constitution inheritance)
- [ ] T014 [US1] Add Structurizr views section to `c4/workspace.dsl`: systemContext view, container view, and theme configuration
- [ ] T015 [US1] Validate DSL by running `structurizr-cli export` locally or via Docker and fix any parse errors

**Checkpoint**: Full 26-container C4 model with relationships and views. Renderable without errors.

---

## Phase 4: User Story 2 — Document Architecture Decisions & Spikes (Priority: P2)

**Goal**: Initial set of ADRs and SPIKEs that reference containers from the C4 workspace, demonstrating the documentation pattern.

**Independent Test**: Each ADR/SPIKE is a valid Markdown file with correct front matter, references to DSL container IDs, and (for SPIKEs) ≥2 options with effort estimates.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create `docs/spikes/spike-001-vindicta-core-decomposition.md` — 3 options (Extract Config, Thin Contracts Kernel, Domain-Owned Contracts) with container diff sketches and migration effort
- [ ] T017 [P] [US2] Create `docs/spikes/spike-002-game-simulation-training-arena.md` — reframe Game Simulation group as Primordia's training gym with 3 evolution options
- [ ] T018 [US2] Create `docs/adr/0004-c4-architecture-model.md` — record the decision to adopt C4/Structurizr for platform architecture visualization (Status: Accepted)
- [ ] T019 [US2] Create `docs/adr/0005-vindicta-core-minimal-kernel.md` — record the proposed decomposition of Vindicta-Core referencing SPIKE-001 (Status: Proposed)
- [ ] T020 [US2] Update `docs/architecture/overview.md` to reference the C4 model at `c4/workspace.dsl` and link to rendered diagrams

**Checkpoint**: ADRs and SPIKEs created, all referencing container IDs from the DSL. Architecture overview updated.

---

## Phase 5: User Story 3 — Publish Rendered Architecture Diagrams via CI (Priority: P3)

**Goal**: CI automatically validates DSL on PRs and renders + publishes diagrams on merge to `main`.

**Independent Test**: Push a DSL change to a PR branch — CI validates. Merge to `main` — rendered diagrams appear in `docs/assets/c4/` and are accessible via GitHub Pages.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Create `docs/assets/c4/` directory with `.gitkeep` for rendered diagram output
- [ ] T022 [US3] Create `.github/workflows/c4-render.yml` — GitHub Actions workflow that:
  - Triggers on PRs touching `c4/**`
  - Runs `structurizr-cli export` to validate DSL (blocks merge on failure)
  - On merge to `main`: renders PNG + SVG diagrams and commits them to `docs/assets/c4/`
- [ ] T023 [US3] Add `paths-ignore` directive to existing `ci.yml` to exclude `c4/` from general CI (the new dedicated workflow handles it)
- [ ] T024 [US3] Test the CI workflow by pushing a DSL change and verifying diagram artifacts are generated
- [ ] T025 [US3] Update `c4/README.md` with links to rendered diagrams in `docs/assets/c4/`

**Checkpoint**: CI validates DSL on PRs, renders and commits diagrams on merge. Diagrams browsable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation cleanup

- [ ] T026 [P] Verify all 26 containers are present by cross-referencing with inventory master
- [ ] T027 [P] Validate all ADR/SPIKE markdown links are not broken
- [ ] T028 Update `CHANGELOG.md` with C4 domain modeling feature entry
- [ ] T029 Run full Structurizr CLI export and verify all diagram views render correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (workspace skeleton exists)
- **US2 (Phase 4)**: Depends on US1 (needs container IDs to reference)
- **US3 (Phase 5)**: Depends on US1 (needs a valid DSL to render)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No story dependencies.
- **US2 (P2)**: Depends on US1 completion (needs container IDs from the DSL for references).
- **US3 (P3)**: Depends on US1 completion (needs a valid DSL to render). Can proceed in parallel with US2.

### Within Each User Story

- Setup tasks before content tasks
- Content creation before validation
- All [P] tasks within a phase can run in parallel

### Parallel Opportunities

- T001, T002, T003 (Setup) are all parallelizable
- T007–T012 (container groups) are all parallelizable — different sections of the same file but independent logical blocks
- T016, T017 (SPIKEs) are parallelizable
- T021 (directory setup) can run parallel with T022 drafting
- US2 and US3 can proceed in parallel once US1 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all container group tasks together:
Task: "Add Interface group containers to c4/workspace.dsl"
Task: "Add Core Platform group containers to c4/workspace.dsl"
Task: "Add AI & Simulation group containers to c4/workspace.dsl"
Task: "Add Game Recording group containers to c4/workspace.dsl"
Task: "Add Infrastructure group containers to c4/workspace.dsl"
Task: "Add Governance group containers to c4/workspace.dsl"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (directories and README)
2. Complete Phase 2: Foundational (DSL skeleton with groups)
3. Complete Phase 3: User Story 1 (all 26 containers + relationships + views)
4. **STOP and VALIDATE**: Run Structurizr CLI export, verify all containers render
5. The MVP deliverable is a complete C4 Container diagram of the platform

### Incremental Delivery

1. Setup + Foundational → DSL skeleton ready
2. US1 → Full container model → Validate rendering (MVP!)
3. US2 → ADRs + SPIKEs documented → Architecture decisions formalized
4. US3 → CI pipeline → Automated rendering on every merge
5. Polish → Cross-check inventory, validate links, changelog

---

## Summary

| Metric                 | Value                           |
| ---------------------- | ------------------------------- |
| Total tasks            | 29                              |
| Phase 1 (Setup)        | 3 tasks                         |
| Phase 2 (Foundational) | 3 tasks                         |
| Phase 3 (US1 - MVP)    | 9 tasks                         |
| Phase 4 (US2)          | 5 tasks                         |
| Phase 5 (US3)          | 5 tasks                         |
| Phase 6 (Polish)       | 4 tasks                         |
| Parallel opportunities | 16 tasks marked [P]             |
| Suggested MVP scope    | US1 only (Phases 1-3, 15 tasks) |

---

## Notes

- [P] tasks = different files or independent logical sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
