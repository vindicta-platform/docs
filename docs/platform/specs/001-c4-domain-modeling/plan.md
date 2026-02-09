# Implementation Plan: C4 Domain Modeling

**Branch**: `001-c4-domain-modeling` | **Date**: 2026-02-07 | **Spec**: [spec.md](file:///C:/Users/bfoxt/vindicta-platform/Platform-Docs/specs/001-c4-domain-modeling/spec.md)
**Input**: Feature specification from `/specs/001-c4-domain-modeling/spec.md`

## Summary

Establish the canonical C4 architecture model for the Vindicta Platform by authoring a Structurizr DSL workspace covering all 26 repositories across 6 domain groups, with CI-driven diagram rendering and a formal ADR/SPIKE documentation framework.

## Technical Context

**Language/Version**: Structurizr DSL (Structurizr CLI 2024.x)  
**Primary Dependencies**: Structurizr CLI (Java-based, runs via Docker `structurizr/cli`), GitHub Actions  
**Storage**: Git-tracked DSL file + rendered image artifacts  
**Testing**: Structurizr CLI `export` validates DSL syntax; markdownlint for ADR/SPIKE docs  
**Target Platform**: GitHub repository (Platform-Docs) + GitHub Pages for published diagrams  
**Project Type**: Documentation-only (DSL + Markdown + CI workflow)  
**Performance Goals**: CI diagram render completes in under 2 minutes  
**Constraints**: Zero paid tooling (Structurizr Lite/CLI are open-source); diagrams must be viewable without installing anything  
**Scale/Scope**: 26 containers, 6 domain groups, ~40 relationships, 3+ ADRs, 2+ SPIKEs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The Platform-Docs constitution is currently a template (not filled in). The following gates are evaluated against the **Platform Constitution v1.0.0** from the governance KI:

| Gate                     | Requirement                      | Status                              |
| ------------------------ | -------------------------------- | ----------------------------------- |
| Spec-Driven              | Every feature starts with a spec | ✅ spec.md written                   |
| Economic Prime Directive | Zero spend on free tier          | ✅ Structurizr CLI is open-source    |
| Doc Integrity            | Markdown link validation         | ✅ ADRs/SPIKEs use relative links    |
| CI Path Filtering        | CI only runs on relevant paths   | ✅ Workflow triggers on `c4/**` only |

**Result**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-c4-domain-modeling/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output
```

### Source Layout (repository root)

```text
c4/
├── workspace.dsl        # The Structurizr DSL model (single source of truth)
└── README.md            # CLI version, render instructions, domain rationale

docs/
├── adr/
│   ├── 000-template.md  # ADR template (existing)
│   ├── 0001-*.md        # Existing ADRs
│   └── 0004-*.md+       # New ADRs from this feature
├── spikes/              # NEW directory
│   ├── spike-001-*.md
│   └── spike-002-*.md
└── architecture/
    └── overview.md      # Updated to reference C4 model

.github/workflows/
└── c4-render.yml        # NEW CI workflow for diagram rendering
```

**Structure Decision**: Documentation-only feature. The DSL lives in `c4/` at repo root (consistent with Structurizr conventions). ADRs stay in `docs/adr/` (existing). SPIKEs get a new `docs/spikes/` directory. A new CI workflow handles rendering.

## Research Summary

### Structurizr CLI Usage

- **Decision**: Use `structurizr/cli` Docker image in GitHub Actions for rendering.
- **Rationale**: No Java installation required on runners; Docker image is maintained by the Structurizr project; consistent behavior across environments.
- **Alternatives considered**: (1) Direct Java install — adds complexity and version drift. (2) Structurizr Cloud — paid service, violates Economic Prime Directive.

### Diagram Export Format

- **Decision**: Export as PNG (for embedding in Markdown/README) and SVG (for high-quality viewing).
- **Rationale**: PNG provides universal compatibility; SVG provides scalable quality for architecture reviews.
- **Alternatives considered**: PlantUML export — adds a PlantUML dependency and loses Structurizr styling.

### Diagram Publishing

- **Decision**: Commit rendered diagrams to `docs/assets/c4/` on merge to `main`, and publish via existing GitHub Pages setup.
- **Rationale**: The `gh-pages` branch already exists. Committing images makes them referenceable from any Markdown doc without additional infrastructure.
- **Alternatives considered**: (1) GitHub Actions artifacts — ephemeral, not browsable. (2) Separate S3 bucket — overkill for static images.

### Domain Grouping Strategy

- **Decision**: 6 domain groups based on functional cohesion:
  1. **Interface**: Logi-Slate-UI, Vindicta-Portal, Vindicta-CLI
  2. **Core Platform**: Vindicta-Core, Vindicta-API, platform-core
  3. **AI & Simulation**: Meta-Oracle, Primordia-AI, Dice-Engine, Entropy-Buffer
  4. **Game Recording**: WARScribe-Core, WARScribe-Parser, WARScribe-CLI, Battle-Transcript-Toolkit
  5. **Infrastructure**: Economy-Engine, Agent-Auditor-SDK, Quota-Manager, Audit-Log-Pro, Atomic-Ledger-Py, Metered-SaaS-Logic
  6. **Governance**: .specify, .github, Platform-Docs, Vindicta-Agents

- **Rationale**: Groups map to team mental models and data flow boundaries. Each group has clear internal cohesion and well-defined external interfaces.
- **Alternatives considered**: (1) Tier-based grouping (P0/P1/P2/P3) — mixes functional domains. (2) Flat listing — loses architectural insight.

### ADR/SPIKE Integration with C4

- **Decision**: ADRs and SPIKEs reference container IDs (camelCase identifiers from the DSL), not display names.
- **Rationale**: Container IDs are stable identifiers; display names may include spaces or change for readability.
- **Alternatives considered**: Free-text references — prone to drift, harder to grep.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
