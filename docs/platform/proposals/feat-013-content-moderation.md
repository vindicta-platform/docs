# feat-013: Community Content Moderation Pipeline

> **Status**: Proposed  
> **Target Repos**: `Vindicta-API`, `Agent-Auditor-SDK`, `Vindicta-Core`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

With social features (feat-007) and community content, the platform needs **automated content moderation** to maintain a safe environment. This proposal introduces a moderation pipeline using the existing Agent-Auditor-SDK framework, combining automated ML-based detection with manual review workflows.

### 2. System Architecture

```
┌───────────┐   ┌──────────────┐   ┌────────────────┐   ┌─────────────┐
│ User      │   │ Content      │   │ Moderation     │   │ Review      │
│ Content   │─▶│ Ingestion    │─▶│ Agent (SDK)    │─▶│ Queue       │
│           │   │ Pipeline     │   │                │   │ (Manual)    │
└───────────┘   └──────────────┘   └────────┬───────┘   └─────────────┘
                                       │
                               ┌───────▼────────┐
                               │ Audit-Log-Pro │
                               │ (Decisions)   │
                               └───────────────┘
```

**Pipeline Stages**:
1. **Ingestion**: All user-generated content (chat messages, club descriptions, army list names) enters the pipeline.
2. **Automated Scan**: Moderation Agent (built on Agent-Auditor-SDK) uses Google Cloud NLP for toxicity detection.
3. **Threshold Routing**: Score ≥ 0.9 → auto-block; 0.5–0.9 → manual review queue; < 0.5 → approved.
4. **Manual Review**: Platform admins review flagged content via an admin dashboard.
5. **Audit Trail**: All decisions logged via Audit-Log-Pro.

### 3. Data Model

#### New Entities

| Entity | Fields |
|---|---|
| `ModerationCase` | `id`, `contentId`, `contentType`, `contentText`, `authorId`, `toxicityScore`, `status` (pending/approved/rejected), `reviewedBy`, `createdAt` |
| `ModerationRule` | `id`, `pattern`, `action` (block/flag/allow), `reason`, `isRegex` |
| `UserStrike` | `userId`, `caseId`, `strikeNumber`, `issuedAt`, `expiresAt` |

#### Strike Policy

| Strike # | Consequence |
|---|---|
| 1 | Warning notification |
| 2 | 24-hour mute |
| 3 | 7-day suspension |
| 4+ | Permanent ban (manual review) |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/moderation/queue` | Get pending moderation cases |
| `PUT` | `/admin/moderation/:id/action` | Approve or reject content |
| `GET` | `/admin/moderation/rules` | List moderation rules |
| `POST` | `/admin/moderation/rules` | Add a custom rule |
| `GET` | `/admin/users/:id/strikes` | Get user's strike history |

### 4. Security & Scalability

- **Latency**: Automated moderation adds < 200ms to content submission (async where possible).
- **False Positive Rate**: Target < 5%; humans review borderline cases.
- **Privacy**: Content text stored temporarily for review; purged 30 days after case closure.
- **Bypass Prevention**: Moderation cannot be bypassed by API clients; enforced at the ingestion layer.

### 5. Assumptions

1. Google Cloud NLP Natural Language API is used for toxicity scoring.
2. Agent-Auditor-SDK provides the agent framework for the moderation agent.
3. Feature depends on feat-001 (Auth) for user identity and feat-007 (Social) for content sources.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-026: Auto-Block Toxic Content
> As a **platform operator**, I want **toxic messages to be automatically blocked** so that **the community remains safe without requiring constant manual monitoring**.

```gherkin
Feature: Automated Content Moderation

  Scenario: Toxic message auto-blocked
    Given a user sends a chat message with toxicity score 0.95
    When the moderation agent processes the message
    Then the message is blocked and not delivered
    And a ModerationCase is created with status "rejected"
    And the user receives a warning
    And a UserStrike is created

  Scenario: Borderline content flagged for review
    Given a user sends a message with toxicity score 0.65
    When the moderation agent processes the message
    Then the message is held pending review
    And a ModerationCase is created with status "pending"
    And the message appears in the admin moderation queue

  Scenario: Clean content approved
    Given a user sends a message with toxicity score 0.1
    When the moderation agent processes the message
    Then the message is approved and delivered normally
    And no ModerationCase is created
```

#### US-027: Manual Review Workflow
> As a **platform admin**, I want to **review flagged content** so that **I can make nuanced moderation decisions**.

```gherkin
Feature: Manual Review Queue

  Scenario: Admin approves flagged content
    Given there is a pending ModerationCase for message "GG, that was a close game!"
    When the admin reviews and clicks "Approve"
    Then the message is delivered to the chat channel
    And the ModerationCase status changes to "approved"
    And no strike is issued

  Scenario: Admin rejects flagged content
    Given there is a pending ModerationCase with inappropriate content
    When the admin reviews and clicks "Reject"
    Then the message remains blocked
    And a UserStrike is issued to the author
    And the author is notified of the rejection
```
