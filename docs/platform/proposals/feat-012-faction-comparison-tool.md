# feat-012: Faction Comparison Tool

> **Status**: Proposed  
> **Target Repos**: `Meta-Oracle`, `Vindicta-Portal`, `Vindicta-API`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

Players frequently want to compare factions head-to-head before committing to an army. Meta-Oracle has the data but there is **no dedicated comparison interface**. This proposal adds a **Faction Comparison Tool** that allows side-by-side analysis of two or more factions across win rates, popular units, matchup spreads, and simulation outcomes.

### 2. System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Comparison  │────▶│  Comparison  │────▶│  Meta-Oracle │
│  View (UI)   │     │  API         │     │  (Data)      │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Components**:
- **Comparison API**: Endpoint that accepts 2–4 faction IDs and returns a structured comparison object.
- **Comparison View**: Split-panel UI with radar charts, bar charts, and matchup tables.
- **Shareable Links**: URL encodes selected factions for sharable comparisons.

### 3. Data Model

#### Comparison Response Schema

```json
{
  "factions": [
    {
      "id": "adeptus-astartes",
      "name": "Adeptus Astartes",
      "winRate": 52.3,
      "pickRate": 18.7,
      "avgBattlePoints": 67.2,
      "topUnits": ["Intercessors", "Redemptor Dreadnought", "Chaplain"],
      "bestMatchup": { "faction": "T'au Empire", "winRate": 61.2 },
      "worstMatchup": { "faction": "Aeldari", "winRate": 42.8 }
    },
    { "id": "aeldari", "..." }
  ],
  "headToHead": {
    "totalGames": 1247,
    "winRates": { "adeptus-astartes": 48.1, "aeldari": 51.9 }
  }
}
```

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/compare?factions=id1,id2` | Compare 2–4 factions |
| `GET` | `/factions` | List all available factions |
| `GET` | `/factions/:id/matchups` | Get matchup spread for a faction |

### 4. Security & Scalability

- **Caching**: Comparison results cached for 1 hour (faction-pair composite key in Redis).
- **Limit**: Max 4 factions per comparison to bound response size.
- **Rate Limit**: 30 comparison requests/minute per user.
- **Data Freshness**: Meta-Oracle stats are recomputed nightly; comparisons reflect latest data.

### 5. Assumptions

1. Meta-Oracle already tracks per-faction win rates and matchup data.
2. Radar chart dimensions: Win Rate, Pick Rate, Avg Battle Points, Unit Diversity, Matchup Spread.
3. Head-to-head data requires ≥50 games between factions to be statistically meaningful.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-025: Compare Two Factions
> As a **player**, I want to **compare Space Marines vs. Aeldari** so that **I can decide which faction to collect next**.

```gherkin
Feature: Faction Comparison

  Scenario: Compare two factions
    Given the user navigates to the Comparison Tool
    When the user selects "Adeptus Astartes" and "Aeldari"
    Then a side-by-side comparison is displayed
    And the radar chart shows both factions overlaid
    And the matchup table shows head-to-head win rates

  Scenario: Compare three factions
    Given the user has already selected two factions
    When the user adds "Orks" to the comparison
    Then the view updates to show all three factions
    And the radar chart adds an Orks overlay

  Scenario: Share comparison
    Given the user is viewing a comparison of two factions
    When the user clicks "Share"
    Then a URL is generated containing the selected faction IDs
    And the URL can be opened by another user to see the same comparison

  Scenario: Insufficient data warning
    Given the head-to-head record between two factions has fewer than 50 games
    When the user views the comparison
    Then a warning is displayed: "Limited data — results may not be statistically significant"
```
