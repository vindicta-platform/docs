# Platform Overview

Vindicta's modular architecture explained.

---

## Design Philosophy

Vindicta follows a **modular monolith** approach:

- Each component is a standalone, independently deployable module
- Components communicate through well-defined interfaces
- The platform-core integrates all modules for unified deployment

```
┌─────────────────────────────────────────────────────────────┐
│                     Vindicta Platform                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Logi-    │  │ Vindicta │  │ Vindicta │  │ Vindicta │    │
│  │ Slate UI │  │ CLI      │  │ API      │  │ Core     │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │          │
│  ─────┴─────────────┴─────────────┴─────────────┴──────    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Dice     │  │ Economy  │  │ Meta-    │  │ WARScribe│    │
│  │ Engine   │  │ Engine   │  │ Oracle   │  │ Core     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

| Module | Purpose |
|--------|---------|
| **Vindicta-Core** | Shared primitives, config, interfaces |
| **Vindicta-API** | REST endpoints via FastAPI |
| **Vindicta-CLI** | Unified command-line interface |
| **Dice-Engine** | CSPRNG dice with entropy proofs |
| **Economy-Engine** | Gas Tank, Ledger, Meter |
| **Meta-Oracle** | AI prediction engine |
| **Quota-Manager** | Usage tracking |
| **WARScribe-Core** | Action notation engine |

## Data Flow

```
User → UI/CLI → API → [ Service Modules ] → Database
                           │
                    ┌──────┴──────┐
                    ↓             ↓
              Dice Engine   Meta-Oracle
```

---

## Deployment Options

1. **Full Platform** — All modules integrated
2. **Individual Modules** — Use specific components
3. **Self-Hosted** — Run on your infrastructure
