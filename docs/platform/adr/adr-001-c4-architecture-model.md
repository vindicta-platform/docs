# ADR-001: Structurizr DSL as Canonical Architecture Model

## Status

Accepted

## Date

2026-02-07

## Context

The Vindicta Platform has an exploding architectural footprint across 26+ repositories spanning multiple functional domains. There is no single view or entrypoint for an administrator to understand the full system topology, dependencies, and evolution state.

Alternatives considered:
- **Pure Mermaid diagrams** — Simple, no tooling. But lacks single-model/many-views semantics; each diagram is a disconnected artifact that drifts independently.
- **Structurizr (hosted SaaS)** — Full-featured but introduces external dependency and cost.
- **Doc sites (MkDocs-only)** — Already in use for Platform-Docs, but prose-based architecture docs don't provide the structured, queryable model needed.
- **Structurizr DSL (local)** — Single `.dsl` file is the source of truth. Multiple views (C4 L1–L3) are derived from one model. Tooling is open-source. Diagrams are CI-generated artifacts, never hand-edited.

## Decision

Use **Structurizr DSL** (`workspace.dsl`) as the canonical architecture model for the Vindicta Platform.

- The DSL file is the single source of truth for all architecture views.
- Diagrams (Mermaid, SVG) are **CI-generated deployment artifacts**, never committed to `main`.
- Rendered output is served via **GitHub Pages**.
- The architecture entrypoint lives at `docs/architecture/index.md` in Platform-Docs.

## Consequences

- **Requires CI pipeline**: A GitHub Actions workflow must render DSL → diagrams on every push.
- **Diagrams are immutable artifacts**: No hand-editing of generated output. Changes flow through the DSL.
- **Staleness mitigation**: Automated CI checks validate that the DSL model matches the actual GitHub org state.
- **Learning curve**: Contributors must understand Structurizr DSL syntax to propose architecture changes.
- **Evolution path**: Structurizr Lite (Docker) can be added later for interactive local exploration.
