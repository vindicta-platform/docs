# feat-004: Tournament Management System

> **Status**: Proposed  
> **Target Repos**: `Vindicta-Core`, `Vindicta-API`, `Vindicta-Portal`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

Competitive play is a core driver of the Warhammer community. This proposal introduces a **Tournament Management System** (TMS) covering event creation, player registration, Swiss/elimination bracket generation, match scoring, and live leaderboard tracking.

### 2. System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Tournament  │────▶│  Vindicta    │────▶│  Bracket     │
│  Portal UI   │     │  API         │     │  Engine      │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │  Firestore   │
                    │  (State)     │
                    └──────────────┘
```

**Components**:
- **Bracket Engine**: Pure function library (in `Vindicta-Core`) implementing Swiss and single/double elimination pairing algorithms.
- **TMS API**: RESTful CRUD for tournaments, rounds, matches, and standings.
- **Portal UI**: Tournament dashboard, bracket visualizer, and score entry forms.

### 3. Data Model

#### New Entities

| Entity | Fields |
|---|---|
| `Tournament` | `id`, `name`, `format` (Swiss/Elimination), `pointsLimit`, `maxPlayers`, `startDate`, `status`, `createdBy` |
| `Registration` | `tournamentId`, `playerId`, `armyListId`, `registeredAt`, `status` |
| `Round` | `tournamentId`, `number`, `pairings[]`, `status` |
| `Match` | `roundId`, `player1Id`, `player2Id`, `score1`, `score2`, `result`, `reportedBy` |
| `Standing` | `tournamentId`, `playerId`, `wins`, `losses`, `draws`, `battlePoints`, `rank` |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/tournaments` | Create a tournament |
| `GET` | `/tournaments` | List tournaments (filterable) |
| `POST` | `/tournaments/:id/register` | Register for a tournament |
| `POST` | `/tournaments/:id/rounds/generate` | Generate next round pairings |
| `PUT` | `/tournaments/:id/matches/:matchId` | Submit match result |
| `GET` | `/tournaments/:id/standings` | Get live standings |

### 4. Security & Scalability

- **Authorization**: Only `club_admin` or `platform_admin` can create tournaments (depends on feat-001).
- **Concurrency**: Match results use optimistic locking (Firestore transactions) to prevent double-submission.
- **Scale**: Supports tournaments up to 256 players; Swiss pairing runs in O(n log n).
- **Audit Trail**: All score changes logged via `Audit-Log-Pro`.

### 5. Assumptions

1. Swiss pairing uses tie-breakers: Strength of Schedule → Battle Points → Head-to-Head.
2. Army list submission is mandatory at registration (validated via WARScribe-Parser).
3. Feature depends on feat-001 (Auth) for player identity.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-008: Create Tournament
> As a **club admin**, I want to **create a tournament** so that **I can organize competitive events for my local group**.

```gherkin
Feature: Tournament Creation

  Scenario: Create a Swiss tournament
    Given the user has the "club_admin" role
    When the user creates a tournament with format "Swiss" and max 32 players
    Then a Tournament record is created with status "registration_open"
    And the tournament appears in the public tournament listing

  Scenario: Non-admin cannot create tournaments
    Given the user has the "player" role
    When the user attempts to create a tournament
    Then the API returns a 403 Forbidden error
```

#### US-009: Register for Tournament
> As a **player**, I want to **register for a tournament** so that **I can compete against other players**.

```gherkin
Feature: Tournament Registration

  Scenario: Successful registration with valid army list
    Given tournament "GT-2026" has open registration
    And the player has a valid army list under the points limit
    When the player submits their registration
    Then a Registration record is created with status "confirmed"
    And the player count increments by 1

  Scenario: Registration rejected when full
    Given tournament "GT-2026" has reached its max player count
    When a new player attempts to register
    Then the API returns a 409 Conflict
    And the response contains "Tournament is full"
```

#### US-010: Generate Pairings
> As a **tournament organizer**, I want to **auto-generate round pairings** so that **matches are fair and efficient**.

```gherkin
Feature: Round Pairing Generation

  Scenario: Generate Round 1 pairings (random)
    Given tournament "GT-2026" has 32 registered players
    And no rounds have been played
    When the organizer generates Round 1
    Then 16 matches are created with random pairings
    And no player is paired with themselves

  Scenario: Generate Round 2+ pairings (Swiss)
    Given tournament "GT-2026" has completed Round 1
    When the organizer generates Round 2
    Then players are paired by similar win records
    And no two players face each other more than once
```
