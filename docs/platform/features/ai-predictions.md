# AI Predictions

Win probability and tactical insights powered by Meta-Oracle.

---

## Overview

Meta-Oracle uses adversarial AI debate to generate predictions. Five specialized agents argue about outcomes, then a Rule-Sage auditor validates all claims.

## Win Probability

Get matchup predictions:

```bash
vindicta oracle predict \
  --my-list my-list.json \
  --opponent-list opponent.json \
  --mission "Purge the Enemy"
```

Output:

```
Win Probability: 62% (±8%)
Key Factors:
  + Your list has superior shooting
  + Mission favors mobile armies
  - Opponent has better objective control
```

## Pre-Game Analysis

Before you deploy, get tactical suggestions:

- **Priority targets** — What to kill first
- **Deployment tips** — Positioning advice
- **Secondary selection** — Optimal picks

## The 5-Agent Swarm

Meta-Oracle's predictions come from debate between:

| Agent | Role |
|-------|------|
| **Home** | Argues for your list |
| **Adversary** | Argues against |
| **Arbiter** | Provides statistical context |
| **Rule-Sage** | Validates mechanical claims |
| **Council** | Synthesizes final prediction |

## Accuracy

Predictions are based on:

- Historical matchup data
- Monte Carlo simulations
- Mechanical rules validation

!!! warning "Disclaimer"
    Predictions are statistical estimates. Dice rolls, player skill, and unknown factors affect outcomes.
