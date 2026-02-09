# Platform Evolution Tracker

> **Maturity status and health of every Vindicta Platform repository.**
> This document is validated by CI against the GitHub org API — staleness triggers build failure.

---

## Tech Radar Rings

| Ring | Meaning |
|------|--------|
| 🟢 **Adopt** | Production-ready, actively used, stable API |
| 🟡 **Trial** | Under active development, API may change |
| 🟠 **Assess** | Exploratory, evaluating fit for the platform |
| 🔴 **Hold** | Frozen, deprecated, or archived |

---

## Repository Status

### Presentation

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [Vindicta-Portal](https://github.com/vindicta-platform/Vindicta-Portal) | 🟡 Trial | HTML/JS | Active | Static site, CI/CD in place |
| [Vindicta-CLI](https://github.com/vindicta-platform/Vindicta-CLI) | 🟡 Trial | Python | Active | Dev commands implemented, pre-commit hooks configured |
| [Vindicta-API](https://github.com/vindicta-platform/Vindicta-API) | 🟡 Trial | Python | Active | FastAPI REST endpoints |
| [Logi-Slate-UI](https://github.com/vindicta-platform/Logi-Slate-UI) | 🟠 Assess | React/TS | Active | Component library, design system |

### Game Simulation

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [Dice-Engine](https://github.com/vindicta-platform/Dice-Engine) | 🟡 Trial | Python | Active | CSPRNG with entropy proofs |
| [Entropy-Buffer](https://github.com/vindicta-platform/Entropy-Buffer) | 🟠 Assess | Python | Active | Thread-safe entropy management |

### Game Notation

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [WARScribe-Core](https://github.com/vindicta-platform/WARScribe-Core) | 🟡 Trial | Python | Active | WNS notation engine |
| [WARScribe-Parser](https://github.com/vindicta-platform/WARScribe-Parser) | 🟡 Trial | Python | Active | High-level parsing library |
| [WARScribe-CLI](https://github.com/vindicta-platform/WARScribe-CLI) | 🟠 Assess | Python | Active | Local transcript ingestion |
| [Battle-Transcript-Toolkit](https://github.com/vindicta-platform/Battle-Transcript-Toolkit) | 🟠 Assess | Python | Active | Agent transcript handling |

### Analytics

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [Meta-Oracle](https://github.com/vindicta-platform/Meta-Oracle) | 🟡 Trial | Python | Active | AI debate engine for predictions |

### Primordia

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [Primordia-AI](https://github.com/vindicta-platform/Primordia-AI) | 🟠 Assess | Python | Active | Deterministic tactical AI |
| [Arbiter-Predictor](https://github.com/vindicta-platform/Arbiter-Predictor) | 🟠 Assess | Python | Active | Win probability statistics |

### Platform Services

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [Vindicta-Core](https://github.com/vindicta-platform/Vindicta-Core) | 🟡 Trial | Python | Active | Shared primitives and config |
| [Economy-Engine](https://github.com/vindicta-platform/Economy-Engine) | 🟡 Trial | Python | Active | Gas Tank, Ledger, Meter |
| [Quota-Manager](https://github.com/vindicta-platform/Quota-Manager) | 🟡 Trial | Python | Active | Usage tracking and enforcement |
| [Metered-SaaS-Logic](https://github.com/vindicta-platform/Metered-SaaS-Logic) | 🟠 Assess | Python | Active | Dynamic pricing multipliers |
| [Audit-Log-Pro](https://github.com/vindicta-platform/Audit-Log-Pro) | 🟠 Assess | Python | Active | Dual-sink audit logging |
| [Atomic-Ledger-Py](https://github.com/vindicta-platform/Atomic-Ledger-Py) | 🟠 Assess | Python | Active | Atomic ledger pattern |
| [Agent-Auditor-SDK](https://github.com/vindicta-platform/Agent-Auditor-SDK) | 🟠 Assess | Python | Active | Mechanical Auditor framework |

### Developer Experience

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [Platform-Docs](https://github.com/vindicta-platform/Platform-Docs) | 🟡 Trial | MkDocs | Active | Platform-wide documentation |
| [.github](https://github.com/vindicta-platform/.github) | 🟢 Adopt | YAML | Active | Org config, templates, roadmap |
| [.specify](https://github.com/vindicta-platform/.specify) | 🟡 Trial | Markdown | Active | SDD constitution |
| [.agent](https://github.com/vindicta-platform/.agent) | 🟡 Trial | YAML | Active | Agent workflows |
| [Vindicta-Agents](https://github.com/vindicta-platform/Vindicta-Agents) | 🟡 Trial | Docker | Active | Dev container images |

### Archived

| Repository | Ring | Language | Status | Notes |
|-----------|------|----------|--------|-------|
| [platform-core](https://github.com/vindicta-platform/platform-core) | 🔴 Hold | Python | ☠ Archived | Superseded by modular architecture |

---

## Planned Evolution

| Change | Target Phase | Description |
|--------|-------------|-------------|
| Structurizr Lite | V1.2 | Interactive local architecture exploration via Docker |
| Auto-discovery CI | V2 | GitHub API job auto-detects new repos and validates DSL completeness |
| GCP deployment views | V3 | C4 Level 4 code diagrams + Cloud Run / GCS deployment architecture |

---

*Last updated: 2026-02-07 — Validated against GitHub org API via CI.*
