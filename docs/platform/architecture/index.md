# Vindicta Platform — Architecture

> **Single entrypoint for the platform's architectural footprint.**
> All diagrams are generated from the canonical [workspace.dsl](../../c4/workspace.dsl) — never hand-edited.

---

## System Context (C4 Level 1)

```mermaid
C4Context
    title Vindicta Platform — System Context

    Person(player, "Competitive Player", "Builds lists, tracks matches, analyzes the meta")
    Person(to, "Tournament Organizer", "Runs events, manages pairings, reviews results")
    Person(admin, "Platform Admin", "Maintains infrastructure, monitors health, evolves the platform")

    System(vindicta, "Vindicta Platform", "Unified competitive Warhammer 40k platform for army management, match tracking, meta analysis, and AI predictions")

    System_Ext(gcp, "Google Cloud Platform", "Hosting, databases, cloud services")
    System_Ext(github, "GitHub", "Source control, CI/CD, project management")

    Rel(player, vindicta, "Uses", "HTTPS, CLI")
    Rel(to, vindicta, "Manages tournaments via", "HTTPS")
    Rel(admin, vindicta, "Administers and evolves", "CLI, GitHub")
    Rel(vindicta, gcp, "Deployed to")
    Rel(vindicta, github, "Source-controlled and built via")
```

---

## Container Overview (C4 Level 2)

```mermaid
C4Container
    title Vindicta Platform — Container Overview

    Person(player, "Competitive Player")
    Person(admin, "Platform Admin")

    System_Boundary(vindicta, "Vindicta Platform") {

        Boundary(presentation, "Presentation") {
            Container(portal, "Vindicta-Portal", "HTML/JS", "Web portal for players")
            Container(ui, "Logi-Slate-UI", "React, Tailwind", "Component library")
            Container(cli, "Vindicta-CLI", "Python, Click", "Unified CLI")
            Container(api, "Vindicta-API", "Python, FastAPI", "REST API gateway")
        }

        Boundary(gamesim, "Game Simulation") {
            Container(dice, "Dice-Engine", "Python", "CSPRNG dice with entropy proofs")
            Container(entropy, "Entropy-Buffer", "Python", "Thread-safe RNG seeding")
        }

        Boundary(notation, "Game Notation") {
            Container(wsc, "WARScribe-Core", "Python", "WNS notation engine")
            Container(wsp, "WARScribe-Parser", "Python", "High-level WNS parsing")
            Container(wscli, "WARScribe-CLI", "Python", "Transcript ingestion CLI")
            Container(btt, "Battle-Transcript-Toolkit", "Python", "Agent transcript tools")
        }

        Boundary(analytics, "Analytics") {
            Container(oracle, "Meta-Oracle", "Python", "AI meta analysis and prediction")
        }

        Boundary(primordia, "Primordia") {
            Container(primordiaAI, "Primordia-AI", "Python", "Deterministic tactical AI")
            Container(arbiter, "Arbiter-Predictor", "Python", "Win probability statistics")
        }

        Boundary(platform, "Platform Services") {
            Container(core, "Vindicta-Core", "Python", "Shared primitives and config")
            Container(economy, "Economy-Engine", "Python", "Gas Tank, Ledger, Meter")
            Container(quota, "Quota-Manager", "Python", "Usage tracking and enforcement")
            Container(metered, "Metered-SaaS-Logic", "Python", "Dynamic pricing logic")
            Container(audit, "Audit-Log-Pro", "Python", "Dual-sink audit logging")
            Container(ledger, "Atomic-Ledger-Py", "Python", "Atomic ledger pattern")
            Container(auditor, "Agent-Auditor-SDK", "Python", "Mechanical Auditor framework")
        }

        Boundary(devex, "Developer Experience") {
            Container(docs, "Platform-Docs", "MkDocs", "Architecture and guides")
            Container(ghorg, ".github", "YAML", "Org config and templates")
            Container(specify, ".specify", "Markdown", "SDD constitution")
            Container(agent, ".agent", "YAML", "Agent workflows")
            Container(agents, "Vindicta-Agents", "Docker", "Dev container images")
        }
    }

    Rel(player, portal, "Browses", "HTTPS")
    Rel(player, cli, "Power-user access", "Terminal")
    Rel(admin, cli, "Platform ops", "Terminal")
    Rel(admin, docs, "Reads architecture", "HTTPS")
    Rel(portal, api, "Calls", "REST/JSON")
    Rel(cli, api, "Calls", "REST/JSON")
    Rel(api, dice, "Requests dice rolls")
    Rel(api, oracle, "Requests predictions")
    Rel(api, wsc, "Processes notation")
    Rel(api, quota, "Enforces quotas")
    Rel(dice, entropy, "Seeds from")
    Rel(oracle, arbiter, "Uses win probability")
    Rel(primordiaAI, dice, "Simulates via")
    Rel(wsp, wsc, "Parses via")
```

---

## Domain Views

Navigate to domain-specific architecture views:

| Domain | Description | Key Repos |
|--------|-------------|----------|
| **[Presentation](#presentation)** | User-facing interfaces and API gateway | Vindicta-Portal, Vindicta-CLI, Vindicta-API, Logi-Slate-UI |
| **[Game Simulation](#game-simulation)** | Deterministic game mechanics | Dice-Engine, Entropy-Buffer |
| **[Game Notation](#game-notation)** | Structured game transcription and parsing | WARScribe-Core, WARScribe-Parser, WARScribe-CLI, Battle-Transcript-Toolkit |
| **[Analytics](#analytics)** | Meta analysis and prediction | Meta-Oracle |
| **[Primordia](#primordia)** | Deterministic tactical AI and evaluation | Primordia-AI, Arbiter-Predictor |
| **[Platform Services](#platform-services)** | Shared primitives, usage, metering, compliance | Vindicta-Core, Economy-Engine, Quota-Manager, Metered-SaaS-Logic, Audit-Log-Pro, Atomic-Ledger-Py, Agent-Auditor-SDK |
| **[Developer Experience](#developer-experience)** | Docs, org config, agents, tooling | Platform-Docs, .github, .specify, .agent, Vindicta-Agents |

---

### Presentation

```mermaid
C4Container
    title Presentation Domain

    Person(player, "Competitive Player")
    Person(to, "Tournament Organizer")
    Person(admin, "Platform Admin")

    System_Boundary(pres, "Presentation") {
        Container(portal, "Vindicta-Portal", "HTML/JS", "Web portal — static hosted on GCP")
        Container(ui, "Logi-Slate-UI", "React, TypeScript, Tailwind", "Design system component library")
        Container(cli, "Vindicta-CLI", "Python, Click", "Unified CLI for devs and power users")
        Container(api, "Vindicta-API", "Python, FastAPI", "REST API gateway to all services")
    }

    Container_Ext(core, "Vindicta-Core", "Shared primitives")

    Rel(player, portal, "Browses", "HTTPS")
    Rel(player, cli, "Power-user access", "Terminal")
    Rel(to, portal, "Manages events", "HTTPS")
    Rel(admin, cli, "Platform operations", "Terminal")
    Rel(portal, ui, "Uses components from")
    Rel(portal, api, "Calls", "REST/JSON")
    Rel(cli, api, "Calls", "REST/JSON")
    Rel(api, core, "Uses shared primitives")
    Rel(cli, core, "Uses shared primitives")
```

### Game Simulation

```mermaid
C4Container
    title Game Simulation Domain

    Container_Ext(api, "Vindicta-API", "REST gateway")

    System_Boundary(sim, "Game Simulation") {
        Container(dice, "Dice-Engine", "Python", "CSPRNG dice roller with entropy proofs")
        Container(entropy, "Entropy-Buffer", "Python", "Thread-safe buffered entropy management")
    }

    Rel(api, dice, "Requests dice rolls")
    Rel(dice, entropy, "Seeds RNG from")
```

### Game Notation

```mermaid
C4Container
    title Game Notation Domain

    Container_Ext(api, "Vindicta-API", "REST gateway")

    System_Boundary(notation, "Game Notation") {
        Container(wsc, "WARScribe-Core", "Python", "Wargame Notation System engine")
        Container(wsp, "WARScribe-Parser", "Python", "High-level WNS parsing library")
        Container(wscli, "WARScribe-CLI", "Python", "Local transcript ingestion CLI")
        Container(btt, "Battle-Transcript-Toolkit", "Python", "Complex agent transcript handling")
    }

    Rel(api, wsc, "Processes game notation")
    Rel(wsp, wsc, "Parses WNS via")
    Rel(wscli, wsp, "Uses")
    Rel(btt, wsc, "Processes transcripts via")
```

### Analytics

```mermaid
C4Container
    title Analytics Domain

    Container_Ext(api, "Vindicta-API", "REST gateway")
    Container_Ext(wsc, "WARScribe-Core", "WNS engine")
    Container_Ext(arbiter, "Arbiter-Predictor", "Win probability")

    System_Boundary(analytics, "Analytics") {
        Container(oracle, "Meta-Oracle", "Python", "AI debate engine for meta prediction")
    }

    Rel(api, oracle, "Requests predictions")
    Rel(oracle, arbiter, "Uses win probability from")
    Rel(oracle, wsc, "Reads game notation via")
```

### Primordia

```mermaid
C4Container
    title Primordia Domain

    Container_Ext(dice, "Dice-Engine", "CSPRNG dice")

    System_Boundary(primordia, "Primordia") {
        Container(primordiaAI, "Primordia-AI", "Python", "Deterministic tactical AI — the Stockfish of Warhammer")
        Container(arbiter, "Arbiter-Predictor", "Python", "Statistical win probability calculations")
    }

    Rel(primordiaAI, dice, "Simulates outcomes via")
    Rel(primordiaAI, arbiter, "Evaluates positions via")
```

### Platform Services

```mermaid
C4Container
    title Platform Services Domain

    System_Boundary(svc, "Platform Services") {
        Container(core, "Vindicta-Core", "Python", "Shared primitives, config, interfaces")
        Container(economy, "Economy-Engine", "Python", "Gas Tank, Atomic Ledger, Usage Meter")
        Container(quota, "Quota-Manager", "Python", "Usage tracking and enforcement")
        Container(metered, "Metered-SaaS-Logic", "Python", "Dynamic pricing multipliers")
        Container(audit, "Audit-Log-Pro", "Python", "Dual-sink transactional audit logging")
        Container(ledger, "Atomic-Ledger-Py", "Python", "Atomic ledger pattern implementation")
        Container(auditor, "Agent-Auditor-SDK", "Python", "Mechanical Auditor compliance framework")
    }

    Rel(economy, ledger, "Uses atomic ledger pattern")
    Rel(economy, metered, "Applies pricing multipliers")
    Rel(quota, metered, "Uses metering logic from")
    Rel(auditor, audit, "Writes audit trails to")
```

### Developer Experience

```mermaid
C4Container
    title Developer Experience Domain

    Person(admin, "Platform Admin")
    System_Ext(github, "GitHub")

    System_Boundary(devex, "Developer Experience") {
        Container(docs, "Platform-Docs", "MkDocs Material", "Architecture, guides, and ADRs")
        Container(ghorg, ".github", "YAML, Markdown", "Org config, templates, issue forms, roadmap")
        Container(specify, ".specify", "Markdown", "SDD constitution and memory")
        Container(agent, ".agent", "Markdown, YAML", "Org-wide agent workflows and automation")
        Container(agents, "Vindicta-Agents", "Docker, PowerShell", "Dev container images and agent runtimes")
    }

    Rel(admin, docs, "Reads and evolves architecture", "HTTPS")
    Rel(docs, github, "Published via", "GitHub Pages")
    Rel(ghorg, github, "Configures", "Org settings")
    Rel(agents, github, "Builds via", "GitHub Actions")
```

---

## Evolution Status

See [evolution.md](./evolution.md) for per-repo maturity tracking and tech radar status.

---

*Generated from [c4/workspace.dsl](../../c4/workspace.dsl) — see [ADR-001](../adr/adr-001-c4-architecture-model.md) for the decision record.*
