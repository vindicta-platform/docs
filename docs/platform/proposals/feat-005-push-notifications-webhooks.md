# feat-005: Push Notifications & Webhook Events

> **Status**: Proposed  
> **Target Repos**: `Vindicta-API`, `Vindicta-Core`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The platform currently has **no event notification system**. Users must manually poll for updates. This proposal introduces:
1. **Push Notifications**: Firebase Cloud Messaging (FCM) for browser/mobile push.
2. **Webhooks**: HTTP POST callbacks for third-party integrations (Discord bots, stat trackers, etc.).

### 2. System Architecture

```
┌─────────────┐    ┌───────────────┐    ┌────────────────┐
│  Domain     │───▶│  Event        │───▶│  Dispatcher    │
│  Services   │    │  Bus (Redis)  │    │  Service       │
└─────────────┘    └───────────────┘    └───┬────────┬───┘
                                           │        │
                                    ┌──────▼──┐  ┌──▼──────────┐
                                    │  FCM    │  │  Webhook    │
                                    │  Push   │  │  Delivery   │
                                    └─────────┘  └─────────────┘
```

**Flow**:
1. Domain services emit events to Redis Pub/Sub (e.g., `tournament.round_generated`, `simulation.completed`).
2. The Dispatcher Service consumes events and routes them to registered notification channels.
3. FCM handles browser push; Webhook Delivery handles HTTP POST to registered URLs.

### 3. Data Model

#### New Entities

| Entity | Fields |
|---|---|
| `NotificationPreference` | `userId`, `channel` (push/email/webhook), `eventTypes[]`, `enabled` |
| `WebhookSubscription` | `id`, `userId`, `url`, `secret`, `eventTypes[]`, `status`, `failureCount` |
| `NotificationLog` | `id`, `userId`, `eventType`, `channel`, `payload`, `deliveredAt`, `status` |

#### Supported Event Types

| Event | Description |
|---|---|
| `simulation.completed` | A simulation run has finished |
| `tournament.round_generated` | New pairings are available |
| `tournament.result_submitted` | A match result was posted |
| `army.import_complete` | Army list import finished |
| `meta.shift_detected` | Meta-Oracle detected a meta shift |
| `account.role_changed` | User's role was updated |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/notifications/preferences` | Get user notification preferences |
| `PUT` | `/notifications/preferences` | Update notification preferences |
| `POST` | `/webhooks` | Register a webhook URL |
| `GET` | `/webhooks` | List user's webhooks |
| `DELETE` | `/webhooks/:id` | Remove a webhook |
| `POST` | `/webhooks/:id/test` | Send a test event to webhook |

### 4. Security & Scalability

- **Webhook Security**: HMAC-SHA256 signature in `X-Vindicta-Signature` header; secret generated at registration.
- **Retry Policy**: Failed webhook deliveries retried 3 times with exponential backoff (1s, 5s, 25s).
- **Circuit Breaker**: After 10 consecutive failures, webhook is auto-disabled; owner notified.
- **Rate Limit**: Max 100 webhook deliveries/minute per subscription.
- **GDPR**: Notification logs auto-purged after 90 days.

### 5. Assumptions

1. Firebase Cloud Messaging is used for push (aligns with GCP stack).
2. Email notifications are out of scope for v1 (deferred to a follow-up).
3. Webhook payload format matches the internal event schema (JSON).

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-011: Receive Push Notification
> As a **player**, I want to **receive browser push notifications** so that **I know when my simulation is complete without keeping the tab open**.

```gherkin
Feature: Push Notifications

  Scenario: Player receives push on simulation complete
    Given the player has enabled push notifications for "simulation.completed"
    And the player's browser has granted notification permission
    When a simulation owned by the player finishes
    Then the player receives a browser push notification within 5 seconds
    And the notification title is "Simulation Complete"
    And the notification body contains the simulation name

  Scenario: Push not sent when disabled
    Given the player has disabled push notifications
    When a simulation owned by the player finishes
    Then no push notification is sent
```

#### US-012: Register Webhook
> As a **developer**, I want to **register a webhook URL** so that **my Discord bot can post tournament updates automatically**.

```gherkin
Feature: Webhook Registration

  Scenario: Register a webhook
    Given the user is authenticated
    When the user registers a webhook with URL "https://my-bot.example.com/hook" for events ["tournament.round_generated"]
    Then a WebhookSubscription is created
    And the response includes a generated HMAC secret

  Scenario: Test webhook delivery
    Given the user has a registered webhook "wh-789"
    When the user calls POST /webhooks/wh-789/test
    Then a test event is sent to the webhook URL
    And the response confirms delivery status

  Scenario: Webhook auto-disabled after failures
    Given webhook "wh-789" has failed 10 consecutive deliveries
    Then the webhook status is set to "disabled"
    And the owner receives a notification about the disabled webhook
```
