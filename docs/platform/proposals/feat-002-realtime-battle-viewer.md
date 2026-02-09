# feat-002: Real-time Battle Simulation Viewer

> **Status**: Proposed  
> **Target Repos**: `Vindicta-Portal`, `Dice-Engine`, `Vindicta-API`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The Dice-Engine currently runs simulations as batch processes with results returned synchronously. This proposal adds a **real-time WebSocket layer** that streams dice rolls, phase transitions, and outcome calculations to connected clients, enabling a live "battle viewer" experience in the Portal.

### 2. System Architecture

```
┌──────────────┐  WebSocket   ┌──────────────┐    Event Bus    ┌──────────────┐
│  Vindicta    │◀────────────▶│  WS Gateway  │◀──────────────▶│  Dice-Engine │
│  Portal      │  (wss://)    │  (Node.js)   │   (Redis Pub/  │  (Simulator) │
│  (Browser)   │              │              │    Sub)        │              │
└──────────────┘              └──────────────┘                └──────────────┘
```

**Components**:
- **WS Gateway**: New Node.js service handling WebSocket connections, room management, and event broadcasting.
- **Event Bus**: Redis Pub/Sub channel per simulation session.
- **Portal Viewer**: React component rendering animated dice rolls, phase progress bars, and unit casualty tracking.

### 3. Data Model

#### WebSocket Event Schema

```json
{
  "sessionId": "sim-abc-123",
  "event": "DICE_ROLL",
  "timestamp": "2026-02-07T14:30:00Z",
  "payload": {
    "phase": "shooting",
    "unit": "Intercessor Squad Alpha",
    "dice": [3, 5, 6, 2, 4],
    "threshold": 3,
    "successes": 3
  }
}
```

#### Event Types

| Event | Description |
|---|---|
| `SESSION_START` | Simulation initialized with army lists |
| `PHASE_CHANGE` | Transition between game phases |
| `DICE_ROLL` | Individual or batch dice roll result |
| `CASUALTY` | Unit takes casualties |
| `MORALE_CHECK` | Morale/leadership test result |
| `SESSION_END` | Final results and summary |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/simulations/live` | Create a live simulation session |
| `GET` | `/simulations/:id/status` | Get session status |
| `WS` | `/ws/simulations/:id` | Connect to live event stream |

### 4. Security & Scalability

- **Connection Auth**: JWT passed as query param on WS handshake; validated before upgrade.
- **Room Isolation**: Each simulation gets its own Redis Pub/Sub channel; no cross-session leakage.
- **Horizontal Scaling**: WS Gateway is stateless with Redis as the shared state; scales behind a load balancer with sticky sessions.
- **Max Connections**: 500 concurrent viewers per simulation; configurable via `Quota-Manager`.
- **Backpressure**: If a client falls behind, events are buffered (max 100); oldest dropped.

### 5. Assumptions

1. Redis is available as the Pub/Sub broker (new infra dependency).
2. The Dice-Engine can emit events per-roll (currently returns aggregated results; minor refactor needed).
3. The Portal uses a modern browser with native WebSocket support.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-004: Watch Live Simulation
> As a **player**, I want to **watch my battle simulation in real time** so that **I can see each dice roll as it happens**.

```gherkin
Feature: Real-time Battle Viewer

  Scenario: Connect to a live simulation
    Given a live simulation session "sim-abc-123" has been created
    And the user is authenticated with a valid JWT
    When the user connects to the WebSocket at "/ws/simulations/sim-abc-123"
    Then the connection is upgraded to WebSocket
    And the user receives a "SESSION_START" event with army list summaries

  Scenario: Receive dice roll events
    Given the user is connected to simulation "sim-abc-123"
    When the Dice-Engine processes a shooting phase roll
    Then the user receives a "DICE_ROLL" event within 100ms
    And the event contains the dice values, threshold, and success count

  Scenario: Simulation completes
    Given the user is connected to simulation "sim-abc-123"
    When all phases have been processed
    Then the user receives a "SESSION_END" event with final scores
    And the WebSocket connection is gracefully closed
```

#### US-005: Viewer Capacity Enforcement
> As a **system operator**, I want to **limit concurrent viewers** so that **server resources are protected**.

```gherkin
Feature: Viewer Capacity

  Scenario: Connection rejected when room is full
    Given simulation "sim-abc-123" already has 500 connected viewers
    When a new user attempts to connect via WebSocket
    Then the connection is rejected with a 1013 "Try Again Later" close code
    And the user receives an error message "Viewer capacity reached"

  Scenario: Viewer slot freed on disconnect
    Given simulation "sim-abc-123" has 500 connected viewers
    When one viewer disconnects
    And a new user attempts to connect
    Then the connection is successfully established
```
