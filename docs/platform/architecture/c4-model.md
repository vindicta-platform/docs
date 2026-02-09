# C4 System Architecture

The **Vindicta Platform** architecture is defined using the [C4 Model](https://c4model.com/) and managed as code using [Structurizr DSL](https://structurizr.com/dsl).

This model serves as the canonical source of truth for all system containers, relationships, and component boundaries.

## Workspace DSL

The following DSL definition resides in `c4/workspace.dsl` and can be rendered using Structurizr Lite or CLI.

```structurizr
workspace "Vindicta Platform" "C4 Architecture Model for the unified competitive Warhammer 40k platform." {

    !identifiers hierarchical

    model {
        # ─────────────────────────────────────────────
        # External Actors
        # ─────────────────────────────────────────────
        player = person "Competitive Player" "Warhammer 40k player who builds lists, tracks matches, and analyzes the meta."
        tournamentOrganizer = person "Tournament Organizer" "Runs events, manages pairings, and reviews results."
        platformAdmin = person "Platform Admin" "Maintains infrastructure, monitors health, and evolves the platform."

        # ─────────────────────────────────────────────
        # External Systems
        # ─────────────────────────────────────────────
        gcp = softwareSystem "Google Cloud Platform" "Hosting, databases, and cloud services." "External"
        github = softwareSystem "GitHub" "Source control, CI/CD, and project management." "External"

        # ─────────────────────────────────────────────
        # Vindicta Platform
        # ─────────────────────────────────────────────
        vindicta = softwareSystem "Vindicta Platform" "Unified competitive Warhammer 40k platform for army management, match tracking, meta analysis, and AI predictions." {

            # ═══════════════════════════════════════════
            # DOMAIN: Presentation
            # User-facing interfaces and entry points
            # ═══════════════════════════════════════════
            group "Presentation" {
                portal = container "Vindicta-Portal" "Web portal for players — static site hosted on GCP." "HTML/JS" "Web Browser"
                logiSlateUI = container "Logi-Slate-UI" "React/Tailwind component library implementing the Vindicta design system." "React, TypeScript, Tailwind"
                vindictaCLI = container "Vindicta-CLI" "Unified command-line interface for developers and power users." "Python, Click"
                vindictaAPI = container "Vindicta-API" "REST API gateway — FastAPI endpoints exposing platform services." "Python, FastAPI"
            }

            # ═══════════════════════════════════════════
            # DOMAIN: Game Simulation
            # Deterministic game mechanics
            # ═══════════════════════════════════════════
            group "Game Simulation" {
                diceEngine = container "Dice-Engine" "CSPRNG dice roller with entropy proofs and cryptographic fairness guarantees." "Python"
                entropyBuffer = container "Entropy-Buffer" "Thread-safe, buffered entropy management for reliable RNG seeding." "Python"
            }

            # ═══════════════════════════════════════════
            # DOMAIN: Game Notation
            # Structured game transcription and parsing
            # ═══════════════════════════════════════════
            group "Game Notation" {
                warscribeCore = container "WARScribe-Core" "Wargame Notation System (WNS) action notation engine." "Python"
                warscribeParser = container "WARScribe-Parser" "High-level parsing library for WNS transcripts." "Python"
                warscribeCLI = container "WARScribe-CLI" "CLI tools for local wargame transcript ingestion." "Python"
                battleTranscriptToolkit = container "Battle-Transcript-Toolkit" "Markdown tools for complex agent transcript handling." "Python"
            }

            # ═══════════════════════════════════════════
            # DOMAIN: Analytics
            # Meta analysis and prediction
            # ═══════════════════════════════════════════
            group "Analytics" {
                metaOracle = container "Meta-Oracle" "AI debate engine for meta analysis and prediction." "Python"
            }

            # ═══════════════════════════════════════════
            # DOMAIN: Primordia
            # Deterministic tactical AI and evaluation
            # ═══════════════════════════════════════════
            group "Primordia" {
                primordiaAI = container "Primordia-AI" "Deterministic tactical AI engine — the Stockfish of Warhammer." "Python"
                arbiterPredictor = container "Arbiter-Predictor" "Statistical library for win probability calculations." "Python"
            }

            # ═══════════════════════════════════════════
            # DOMAIN: Platform Services
            # Shared primitives, metering, and compliance
            # ═══════════════════════════════════════════
            group "Platform Services" {
                vindictaCore = container "Vindicta-Core" "Shared primitives, configuration, and interfaces used across all modules." "Python"
                economyEngine = container "Economy-Engine" "Gas Tank, Atomic Ledger, and Usage Meter — resource consumption and cost model." "Python"
                quotaManager = container "Quota-Manager" "Usage tracking, quota enforcement, and consumption prediction." "Python"
                meteredSaaSLogic = container "Metered-SaaS-Logic" "Dynamic usage metering and pricing multiplier logic." "Python"
                auditLogPro = container "Audit-Log-Pro" "Dual-sink transactional audit logging system." "Python"
                atomicLedgerPy = container "Atomic-Ledger-Py" "Lightweight atomic ledger pattern implementation for transactional integrity." "Python"
                agentAuditorSDK = container "Agent-Auditor-SDK" "Framework for Mechanical Auditor agents — compliance verification." "Python"
            }

            # ═══════════════════════════════════════════
            # DOMAIN: Developer Experience
            # Tooling, docs, agents, and org config
            # ═══════════════════════════════════════════
            group "Developer Experience" {
                platformDocs = container "Platform-Docs" "MkDocs Material documentation site — platform-wide architecture, guides, and ADRs." "MkDocs, Markdown"
                dotGithub = container ".github" "Organization-wide GitHub configuration, templates, issue forms, and roadmap." "YAML, Markdown"
                dotSpecify = container ".specify" "Specification-Driven Development (SDD) constitution and memory." "Markdown"
                dotAgent = container ".agent" "Organization-wide agent workflows and automation definitions." "Markdown, YAML"
                vindictaAgents = container "Vindicta-Agents" "Dev container images and agent runtime environments." "Docker, PowerShell"
            }
        }

        # ─────────────────────────────────────────────
        # Relationships: Actors → System
        # ─────────────────────────────────────────────
        player -> vindicta "Uses" "HTTPS, CLI"
        tournamentOrganizer -> vindicta "Manages tournaments via" "HTTPS"
        platformAdmin -> vindicta "Administers and evolves" "CLI, GitHub"

        # ─────────────────────────────────────────────
        # Relationships: Actors → Containers
        # ─────────────────────────────────────────────
        player -> vindicta.portal "Browses army lists, matches, meta" "HTTPS"
        player -> vindicta.vindictaCLI "Power-user game management" "Terminal"
        tournamentOrganizer -> vindicta.portal "Manages events" "HTTPS"
        platformAdmin -> vindicta.vindictaCLI "Platform operations" "Terminal"
        platformAdmin -> vindicta.platformDocs "Reads and evolves architecture" "HTTPS"

        # ─────────────────────────────────────────────
        # Relationships: Containers → Containers
        # ─────────────────────────────────────────────

        # Presentation → Backend
        vindicta.portal -> vindicta.vindictaAPI "Calls" "REST/JSON"
        vindicta.portal -> vindicta.logiSlateUI "Uses components from" ""
        vindicta.vindictaCLI -> vindicta.vindictaAPI "Calls" "REST/JSON"

        # API → Domain Services
        vindicta.vindictaAPI -> vindicta.vindictaCore "Uses shared primitives" ""
        vindicta.vindictaAPI -> vindicta.diceEngine "Requests dice rolls" ""
        vindicta.vindictaAPI -> vindicta.economyEngine "Tracks resource usage" ""
        vindicta.vindictaAPI -> vindicta.metaOracle "Requests predictions" ""
        vindicta.vindictaAPI -> vindicta.warscribeCore "Processes game notation" ""
        vindicta.vindictaAPI -> vindicta.quotaManager "Enforces usage quotas" ""

        # Game Simulation internals
        vindicta.diceEngine -> vindicta.entropyBuffer "Seeds RNG from" ""
        vindicta.economyEngine -> vindicta.atomicLedgerPy "Uses atomic ledger pattern" ""
        vindicta.economyEngine -> vindicta.meteredSaaSLogic "Applies pricing multipliers" ""

        # Game Notation internals
        vindicta.warscribeParser -> vindicta.warscribeCore "Parses WNS via" ""
        vindicta.warscribeCLI -> vindicta.warscribeParser "Uses" ""
        vindicta.battleTranscriptToolkit -> vindicta.warscribeCore "Processes transcripts via" ""

        # Analytics internals
        vindicta.metaOracle -> vindicta.arbiterPredictor "Uses win probability from" ""
        vindicta.metaOracle -> vindicta.warscribeCore "Reads game notation via" ""
        vindicta.primordiaAI -> vindicta.diceEngine "Simulates outcomes via" ""
        vindicta.primordiaAI -> vindicta.arbiterPredictor "Evaluates positions via" ""

        # Platform Services internals
        vindicta.quotaManager -> vindicta.meteredSaaSLogic "Uses metering logic from" ""
        vindicta.agentAuditorSDK -> vindicta.auditLogPro "Writes audit trails to" ""

        # Cross-cutting dependencies
        vindicta.vindictaCLI -> vindicta.vindictaCore "Uses shared primitives" ""

        # External system relationships
        vindicta.portal -> gcp "Hosted on" "Cloud Run / GCS"
        vindicta.vindictaAPI -> gcp "Deployed to" "Cloud Run"
        vindicta.vindictaAgents -> github "Builds via" "GitHub Actions"
        vindicta.platformDocs -> github "Published via" "GitHub Pages"
        vindicta.dotGithub -> github "Configures" "Org settings"
    }

    views {
        # ─────────────────────────────────────────────
        # Level 1: System Context
        # ─────────────────────────────────────────────
        systemContext vindicta "SystemContext" {
            include *
            autoLayout
            description "Level 1 — Vindicta Platform in its environment: users and external systems."
        }

        # ─────────────────────────────────────────────
        # Level 2: Container Overview
        # ─────────────────────────────────────────────
        container vindicta "Containers" {
            include *
            autoLayout
            description "Level 2 — All containers grouped by functional domain."
        }

        # ─────────────────────────────────────────────
        # Level 2: Domain-Focused Views
        # ─────────────────────────────────────────────
        container vindicta "Presentation" {
            include vindicta.portal vindicta.logiSlateUI vindicta.vindictaCLI vindicta.vindictaAPI
            include vindicta.vindictaCore
            include player tournamentOrganizer platformAdmin
            autoLayout
            description "Level 2 — Presentation domain: user-facing interfaces and API gateway."
        }

        container vindicta "GameSimulation" {
            include vindicta.diceEngine vindicta.entropyBuffer
            include vindicta.vindictaAPI
            autoLayout
            description "Level 2 — Game Simulation domain: dice and entropy."
        }

        container vindicta "GameNotation" {
            include vindicta.warscribeCore vindicta.warscribeParser vindicta.warscribeCLI vindicta.battleTranscriptToolkit
            include vindicta.vindictaAPI
            autoLayout
            description "Level 2 — Game Notation domain: WARScribe and transcript processing."
        }

        container vindicta "Analytics" {
            include vindicta.metaOracle
            include vindicta.warscribeCore vindicta.arbiterPredictor
            include vindicta.vindictaAPI
            autoLayout
            description "Level 2 — Analytics domain: meta analysis and prediction."
        }

        container vindicta "Primordia" {
            include vindicta.primordiaAI vindicta.arbiterPredictor
            include vindicta.diceEngine
            autoLayout
            description "Level 2 — Primordia domain: deterministic tactical AI and evaluation."
        }

        container vindicta "PlatformServices" {
            include vindicta.vindictaCore vindicta.economyEngine vindicta.quotaManager vindicta.meteredSaaSLogic
            include vindicta.auditLogPro vindicta.atomicLedgerPy vindicta.agentAuditorSDK
            autoLayout
            description "Level 2 — Platform Services domain: shared primitives, usage, metering, and compliance."
        }

        container vindicta "DeveloperExperience" {
            include vindicta.platformDocs vindicta.dotGithub vindicta.dotSpecify vindicta.dotAgent vindicta.vindictaAgents
            include github
            include platformAdmin
            autoLayout
            description "Level 2 — Developer Experience domain: docs, org config, agents, and tooling."
        }

        # ─────────────────────────────────────────────
        # Styles
        # ─────────────────────────────────────────────
        styles {
            element "Software System" {
                background #6B21A8
                color #FFFFFF
                shape RoundedBox
            }
            element "Person" {
                background #7C3AED
                color #FFFFFF
                shape Person
            }
            element "Container" {
                background #8B5CF6
                color #FFFFFF
            }
            element "External" {
                background #374151
                color #9CA3AF
            }
        }
    }

}
```
