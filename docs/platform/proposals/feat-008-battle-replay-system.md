# feat-008: Battle Replay System

> **Status**: Proposed  
> **Target Repos**: `Dice-Engine`, `Vindicta-Portal`, `Vindicta-API`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

Simulation results are currently ephemeral — once a simulation completes, the step-by-step execution data is lost. This proposal introduces a **Battle Replay System** that records every event during a simulation, stores it as a replay file, and allows users to scrub through the battle frame-by-frame in the Portal.

### 2. System Architecture

```
┌──────────┐    ┌──────────────┐    ┌──────────────────┐
│ Dice     │───▶│ Replay       │───▶│ Cloud Storage   │
│ Engine   │    │ Recorder     │    │ (Replay Files)  │
└──────────┘    └──────────────┘    └─────────┬────────┘
                                           │
                                    ┌──────▼────────┐
                                    │ Replay       │
                                    │ Player (UI)  │
                                    └───────────────┘
```

**Components**:
- **Replay Recorder**: Middleware in Dice-Engine that intercepts all events and serializes them to a replay file.
- **Replay Storage**: GCS bucket with compressed JSON replay files (gzipped, ~50KB per 2000pt game).
- **Replay Player**: Portal component with play/pause/scrub controls and animated unit state rendering.

### 3. Data Model

#### Replay File Schema

```json
{
  "version": "1.0",
  "simulationId": "sim-abc-123",
  "armies": { "player1": { ... }, "player2": { ... } },
  "events": [
    { "frame": 0, "type": "SESSION_START", "timestamp": "...", "data": {} },
    { "frame": 1, "type": "PHASE_CHANGE", "timestamp": "...", "data": { "phase": "movement" } },
    { "frame": 2, "type": "DICE_ROLL", "timestamp": "...", "data": { "dice": [4,5,2] } }
  ],
  "totalFrames": 147,
  "duration": "2m 34s"
}
```

#### New Entities

| Entity | Fields |
|---|---|
| `Replay` | `id`, `simulationId`, `ownerId`, `fileUrl`, `fileSize`, `totalFrames`, `isPublic`, `createdAt` |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/replays` | List user's replays |
| `GET` | `/replays/:id` | Get replay metadata |
| `GET` | `/replays/:id/download` | Download replay file |
| `POST` | `/replays/:id/share` | Toggle public sharing |
| `DELETE` | `/replays/:id` | Delete a replay |

### 4. Security & Scalability

- **Storage Quota**: Max 100 replays per user (free tier); unlimited for premium.
- **File Size**: Max 5MB per replay; compression reduces average 2000pt game to ~50KB.
- **CDN**: Replay files served via Cloud CDN with signed URLs (1-hour expiry).
- **Privacy**: Replays are private by default; sharing generates a public URL.

### 5. Assumptions

1. The Dice-Engine event format (from feat-002) is reused for replay recording.
2. GCS is the storage backend (aligns with GCP stack).
3. Replay playback speed is configurable (0.5x, 1x, 2x, 4x).

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-018: Record Simulation as Replay
> As a **player**, I want **my simulations to be automatically recorded** so that **I can review them later**.

```gherkin
Feature: Replay Recording

  Scenario: Simulation automatically recorded
    Given the user runs a simulation with recording enabled
    When the simulation completes
    Then a replay file is stored in Cloud Storage
    And a Replay metadata record is created in Firestore
    And the user can see the replay in their replay library

  Scenario: Recording disabled
    Given the user has disabled auto-recording in settings
    When the user runs a simulation
    Then no replay file is created
```

#### US-019: Play Back a Replay
> As a **player**, I want to **watch a replay of my simulation** so that **I can analyze key decision points**.

```gherkin
Feature: Replay Playback

  Scenario: Play a replay from the beginning
    Given the user selects replay "replay-001" from their library
    When the replay player loads
    Then the initial army state is displayed
    And the play button starts frame-by-frame playback

  Scenario: Scrub to a specific frame
    Given the replay is currently at frame 50 of 147
    When the user drags the scrub bar to frame 100
    Then the display jumps to frame 100
    And the unit states reflect all events up to frame 100

  Scenario: Share a replay
    Given the user has a private replay "replay-001"
    When the user clicks "Share"
    Then the replay is marked as public
    And a shareable URL is generated
```
