# feat-015: Batch Simulation API

> **Status**: Proposed  
> **Target Repos**: `Dice-Engine`, `Vindicta-API`, `Vindicta-Core`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The Dice-Engine currently supports **single-run simulations only**. For statistical analysis, players need to run thousands of simulations to get meaningful probability distributions. This proposal introduces a **Batch Simulation API** that queues and processes bulk simulation jobs, returning aggregated statistical results.

### 2. System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Batch       │────▶│  Job Queue   │────▶│  Worker Pool │
│  API         │     │  (Cloud Tasks)│     │  (Dice-Engine)│
└──────────────┘     └──────────────┘     └─────┬────────┘
                                               │
                                        ┌──────▼─────────┐
                                        │  Aggregation  │
                                        │  Service      │
                                        └──────┬─────────┘
                                               │
                                        ┌──────▼─────────┐
                                        │  Results      │
                                        │  (Firestore)  │
                                        └────────────────┘
```

**Components**:
- **Batch API**: Accepts simulation parameters + iteration count; returns a job ID.
- **Job Queue**: Google Cloud Tasks distributes simulation iterations across workers.
- **Worker Pool**: Horizontally scaled Dice-Engine instances processing individual runs.
- **Aggregation Service**: Collects worker results and computes statistical summaries (mean, median, std dev, percentiles, distributions).

### 3. Data Model

#### Batch Job Schema

```json
{
  "jobId": "batch-xyz-789",
  "status": "processing",
  "config": {
    "army1": "army-123",
    "army2": "army-456",
    "iterations": 10000,
    "scenario": "matched_play_2000"
  },
  "progress": { "completed": 3500, "total": 10000 },
  "createdAt": "2026-02-07T15:00:00Z",
  "estimatedCompletion": "2026-02-07T15:05:00Z"
}
```

#### Aggregated Results Schema

```json
{
  "jobId": "batch-xyz-789",
  "iterations": 10000,
  "army1WinRate": 54.2,
  "army2WinRate": 45.8,
  "statistics": {
    "army1BattlePoints": {
      "mean": 67.3, "median": 68, "stdDev": 12.1,
      "percentiles": { "p25": 58, "p50": 68, "p75": 76, "p95": 88 }
    }
  },
  "distribution": {
    "histogram": [ { "range": "0-10", "count": 23 }, { "range": "10-20", "count": 87 }, "..." ]
  }
}
```

#### New Entities

| Entity | Fields |
|---|---|
| `BatchJob` | `id`, `ownerId`, `config`, `status` (queued/processing/completed/failed), `progress`, `resultUrl`, `createdAt` |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/simulations/batch` | Submit a batch simulation job |
| `GET` | `/simulations/batch/:jobId` | Get job status and progress |
| `GET` | `/simulations/batch/:jobId/results` | Get aggregated results |
| `DELETE` | `/simulations/batch/:jobId` | Cancel a running job |
| `GET` | `/simulations/batch` | List user's batch jobs |

### 4. Security & Scalability

- **Quotas**: Free tier: max 1,000 iterations/job, 5 jobs/day. Premium: 100,000 iterations/job, unlimited.
- **Worker Scaling**: Auto-scaled via Cloud Run; 0 to 50 concurrent workers based on queue depth.
- **Timeout**: Jobs exceeding 30 minutes are auto-cancelled.
- **Cost Control**: Each iteration costed via Metered-SaaS-Logic; users see estimated cost before submitting.
- **Priority**: Premium users' jobs are prioritized in the queue.

### 5. Assumptions

1. Google Cloud Tasks is the job queue (aligns with GCP stack).
2. The Dice-Engine can be containerized and horizontally scaled (stateless simulation logic).
3. Aggregation is performed in-memory; results persisted to Firestore after completion.
4. Feature depends on feat-001 (Auth) for user identity and Metered-SaaS-Logic for billing.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-030: Submit Batch Simulation
> As a **competitive player**, I want to **run 10,000 simulations of my army matchup** so that **I get statistically reliable win rate predictions**.

```gherkin
Feature: Batch Simulation

  Scenario: Submit a batch job
    Given the user has two saved army lists
    When the user submits a batch simulation with 10,000 iterations
    Then a BatchJob is created with status "queued"
    And the response includes a jobId and estimated completion time

  Scenario: Track job progress
    Given a batch job "batch-xyz-789" is processing
    When the user polls GET /simulations/batch/batch-xyz-789
    Then the response shows progress (e.g., 3500/10000 completed)
    And the status is "processing"

  Scenario: View aggregated results
    Given batch job "batch-xyz-789" has completed
    When the user requests the results
    Then the response includes win rates, mean battle points, and distribution histogram
    And the data can be visualized in the analytics dashboard
```

#### US-031: Quota Enforcement
> As a **system operator**, I want to **enforce simulation quotas** so that **resources are fairly distributed**.

```gherkin
Feature: Batch Quota Enforcement

  Scenario: Free tier user exceeds daily job limit
    Given a free-tier user has submitted 5 batch jobs today
    When the user attempts to submit a 6th job
    Then the API returns a 429 Too Many Requests
    And the response contains "Daily batch job limit reached. Upgrade for unlimited access."

  Scenario: Free tier user exceeds iteration limit
    Given a free-tier user submits a batch with 5,000 iterations
    Then the API returns a 400 Bad Request
    And the response contains "Free tier limited to 1,000 iterations per job"

  Scenario: Premium user gets priority
    Given the job queue has 10 pending jobs
    And a premium user submits a new batch job
    Then the premium job is placed ahead of free-tier jobs in the queue
```
