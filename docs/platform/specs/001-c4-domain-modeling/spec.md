# Feature Specification: C4 Domain Modeling

**Feature Branch**: `001-c4-domain-modeling`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: User description: "Establish and maintain the C4 architecture model for the Vindicta Platform — workspace DSL, domain groupings, container definitions, architecture decision records (ADRs), and architectural spikes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author the C4 Workspace Model (Priority: P1)

A platform architect authors a Structurizr DSL workspace that captures the entire Vindicta Platform as a single software system, organized into logical domain groups (Interface, Core Platform, AI & Simulation, Game Recording, Infrastructure, Governance). Every existing repository maps to exactly one container inside the model. Relationships between containers express run-time data flows (e.g., "Vindicta-API → Meta-Oracle: requests predictions via REST").

**Why this priority**: The workspace DSL is the single source of truth for all downstream diagrams and spikes. Without it, no architecture visualization or decision record can reference canonical container names.

**Independent Test**: Opening the DSL file in Structurizr Lite or the CLI should parse without errors and render a System Context + Container diagram showing all 26 repositories grouped into 6 domains.

**Acceptance Scenarios**:

1. **Given** a new `c4/workspace.dsl` file, **When** the architect adds all 26 containers grouped into 6 domains with at least one relationship per group, **Then** Structurizr CLI parses the file without errors and renders a Container diagram.
2. **Given** the workspace DSL exists, **When** a container description is updated (e.g., `.specify` gaining "Organization-wide" scope annotation), **Then** the change is reflected in the next rendered diagram without breaking existing relationships.
3. **Given** the workspace DSL, **When** a new container is added to a domain group, **Then** it appears in the correct visual cluster on the Container diagram and does not overlap existing containers.

---

### User Story 2 - Document Architecture Decisions & Spikes (Priority: P2)

An architect creates ADRs and architectural SPIKEs that reference containers and relationships defined in the C4 workspace. SPIKEs explore structural refactoring options (e.g., decomposing Vindicta-Core, reframing Game Simulation as a training arena) and produce options tables with pros/cons. ADRs record the chosen option with status tracking (Proposed → Accepted → Superseded).

**Why this priority**: Without formal decision records tied to the C4 model, architectural drift occurs silently. SPIKEs ensure refactoring options are evaluated before code changes.

**Independent Test**: Each ADR and SPIKE can be reviewed as a standalone Markdown document. ADRs reference the correct container names from the workspace DSL, and SPIKEs present at least 2 options with migration effort estimates.

**Acceptance Scenarios**:

1. **Given** the C4 workspace is established, **When** an architect identifies a decomposition opportunity (e.g., Vindicta-Core → thin contracts kernel), **Then** a SPIKE document is created in `docs/spikes/` with ≥2 options, each including a C4 container diff sketch and effort estimate.
2. **Given** a SPIKE recommends an option, **When** the team decides to proceed, **Then** an ADR is created in `docs/adr/` with status "Proposed", referencing the SPIKE and the affected containers.
3. **Given** an existing ADR with status "Proposed", **When** the decision is ratified, **Then** the ADR status is updated to "Accepted" and any superseded ADRs are marked accordingly.

---

### User Story 3 - Publish Rendered Architecture Diagrams via CI (Priority: P3)

A contributor pushes changes to the workspace DSL and CI automatically renders updated diagrams (PNG + SVG) and publishes them to a browsable location (e.g., GitHub Pages or the `docs/` directory). Team members can view the latest architecture without installing Structurizr locally.

**Why this priority**: Rendering manually is friction-heavy; automated publishing ensures every merged DSL change produces up-to-date, browsable diagrams for the entire team.

**Independent Test**: Merging a DSL change to `main` triggers CI, which produces diagram image artifacts. The rendered diagrams are accessible via a URL or committed to the repository.

**Acceptance Scenarios**:

1. **Given** a PR modifies `c4/workspace.dsl`, **When** CI runs, **Then** Structurizr CLI exports Container and System Context diagrams as PNG and SVG artifacts.
2. **Given** the CI pipeline succeeds, **When** the PR is merged to `main`, **Then** the rendered diagrams are published to a browsable location within 5 minutes of merge.
3. **Given** an invalid DSL change is pushed, **When** CI runs, **Then** the Structurizr CLI export fails and CI reports the error, blocking merge.

---

### Edge Cases

- What happens when a container is renamed in the DSL but downstream ADRs still reference the old name? — ADRs should use container IDs (camelCase identifiers) matching the DSL, and a CI linting step should flag stale references.
- How does the system handle two SPIKEs proposing conflicting refactoring of the same domain group? — Each SPIKE is independent; conflict resolution happens at the ADR stage where only one option is accepted.
- What if Structurizr CLI version changes break DSL syntax? — Pin the CLI version in CI and document the version in `c4/README.md`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store the C4 architecture model as a single Structurizr DSL file at `c4/workspace.dsl`.
- **FR-002**: The workspace MUST define exactly one software system ("Vindicta Platform") containing all platform containers.
- **FR-003**: Containers MUST be organized into named domain groups: Interface, Core Platform, AI & Simulation, Game Recording, Infrastructure, and Governance.
- **FR-004**: Each container MUST include a human-readable description and a technology tag (e.g., "Python/FastAPI", "React/TypeScript").
- **FR-005**: The workspace MUST define at least one relationship per domain group showing inter-container data flow.
- **FR-006**: Architecture Decision Records MUST follow the ADR template at `docs/adr/000-template.md` and be stored sequentially in `docs/adr/`.
- **FR-007**: Architectural SPIKEs MUST be stored in `docs/spikes/` with a naming convention `spike-NNN-short-description.md`.
- **FR-008**: CI MUST validate the DSL file on every PR touching `c4/` by running `structurizr-cli export`.
- **FR-009**: CI MUST render and publish Container and System Context diagrams on merge to `main`.
- **FR-010**: The `c4/` directory MUST contain a `README.md` documenting the Structurizr CLI version, rendering instructions, and domain group rationale.

### Key Entities

- **Software System**: The top-level Vindicta Platform entity in the C4 model.
- **Container**: An independently deployable unit (maps 1:1 to a GitHub repository).
- **Domain Group**: A logical grouping of related containers (e.g., "AI & Simulation" contains Meta-Oracle, Primordia-AI, Dice-Engine, Entropy-Buffer).
- **Relationship**: A directed data-flow edge between two containers (e.g., "uses", "reads from", "publishes to").
- **ADR**: An Architecture Decision Record capturing a ratified design choice with status lifecycle.
- **SPIKE**: A time-boxed investigation document exploring refactoring options with structured pros/cons.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 26 platform repositories are represented as containers in the C4 model.
- **SC-002**: Every domain group contains at least 2 containers and at least 1 inter-group relationship.
- **SC-003**: Architecture diagrams are viewable by any team member within 5 minutes of a DSL merge to `main`.
- **SC-004**: At least 3 ADRs and 2 SPIKEs are created during the initial modeling effort, each referencing container IDs from the DSL.
- **SC-005**: CI blocks merges of invalid DSL changes 100% of the time (zero broken diagrams on `main`).

## Assumptions

- **Structurizr DSL**: The team uses the open-source Structurizr DSL format and CLI tooling. No paid Structurizr Cloud subscription is required.
- **Repository count**: The platform currently has 26 repositories. The model should accommodate additions without restructuring.
- **ADR format**: The existing ADR template (`docs/adr/000-template.md`) is sufficient and does not need redesign.
- **CI platform**: GitHub Actions is the CI platform. Structurizr CLI can run in a GitHub Actions runner via Docker or direct install.
- **Publishing target**: GitHub Pages (already configured via `gh-pages` branch) is the default publishing target for rendered diagrams.
