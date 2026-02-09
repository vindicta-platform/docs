# Research: C4 Domain Modeling

**Feature**: `001-c4-domain-modeling` | **Date**: 2026-02-07

## Decisions

### R-001: Structurizr Rendering Engine

- **Decision**: Structurizr CLI via Docker (`structurizr/cli`) in GitHub Actions
- **Rationale**: Zero install footprint, deterministic version pinning, maintained by Structurizr project
- **Alternatives**: Direct Java install (version drift), Structurizr Cloud (paid), PlantUML (loses styling)

### R-002: Export Formats

- **Decision**: PNG + SVG dual export
- **Rationale**: PNG for Markdown embedding, SVG for scalable review
- **Alternatives**: PlantUML export (adds dependency), PDF (poor for web viewing)

### R-003: Publishing Pipeline

- **Decision**: Commit rendered images to `docs/assets/c4/` on `main` merge, serve via GitHub Pages (`gh-pages` branch)
- **Rationale**: Leverages existing `gh-pages` infrastructure, images are Markdown-referenceable
- **Alternatives**: Actions artifacts (ephemeral), S3 (overkill)

### R-004: Domain Grouping

- **Decision**: 6 functional domain groups (Interface, Core Platform, AI & Simulation, Game Recording, Infrastructure, Governance)
- **Rationale**: Maps to team mental models, each group has clear data flow boundaries
- **Alternatives**: Tier-based (P0-P3, mixes domains), flat (loses insight)

### R-005: Container-ADR Cross-Referencing

- **Decision**: ADRs and SPIKEs reference DSL container IDs (camelCase), not display names
- **Rationale**: IDs are stable, grepable identifiers; display names can change
- **Alternatives**: Free-text references (prone to drift)
