# feat-007: Social Features — Friends, Clubs & Chat

> **Status**: Proposed  
> **Target Repos**: `Vindicta-API`, `Vindicta-Portal`, `Vindicta-Core`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The Vindicta Platform has **no community or social layer**. Players cannot connect with each other, form clubs, or communicate. This proposal adds a Friends system, Club (guild) management, and real-time text chat.

### 2. System Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Social UI   │    │  Social API  │    │  Chat Service│
│  (Portal)    │───▶│  (REST)      │    │  (WebSocket) │
└──────────────┘    └──────┬───────┘    └─────┬────────┘
                        │                   │
                 ┌──────▼─────────────────▼──────┐
                 │  Firestore                      │
                 │  (friends, clubs, messages)      │
                 └─────────────────────────────────┘
```

### 3. Data Model

#### New Entities

| Entity | Fields |
|---|---|
| `Friendship` | `id`, `requesterId`, `receiverId`, `status` (pending/accepted/blocked), `createdAt` |
| `Club` | `id`, `name`, `description`, `ownerId`, `memberCount`, `avatarUrl`, `isPublic`, `createdAt` |
| `ClubMember` | `clubId`, `userId`, `role` (owner/admin/member), `joinedAt` |
| `ChatMessage` | `id`, `channelId`, `senderId`, `content`, `type` (text/system), `createdAt` |
| `ChatChannel` | `id`, `type` (dm/club), `participantIds[]`, `lastMessageAt` |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/friends/request` | Send friend request |
| `PUT` | `/friends/:id/accept` | Accept friend request |
| `GET` | `/friends` | List friends |
| `POST` | `/clubs` | Create a club |
| `POST` | `/clubs/:id/join` | Join a public club |
| `GET` | `/clubs/:id/members` | List club members |
| `WS` | `/ws/chat/:channelId` | Connect to chat channel |

### 4. Security & Scalability

- **Chat Safety**: Messages scanned for abusive content via Cloud NLP before delivery.
- **Block System**: Blocked users cannot send friend requests or direct messages.
- **Rate Limit**: Max 60 chat messages/minute per user.
- **Club Limits**: Max 200 members per club; max 10 clubs per user.
- **Data Retention**: Chat messages retained for 365 days; then archived.

### 5. Assumptions

1. Chat leverages the same WebSocket infrastructure proposed in feat-002.
2. Voice/video chat is out of scope for v1.
3. Club-level roles are independent of platform roles (feat-001).

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-015: Send Friend Request
> As a **player**, I want to **send a friend request** so that **I can connect with opponents I've enjoyed playing against**.

```gherkin
Feature: Friends System

  Scenario: Send a friend request
    Given the user is viewing player profile "user-456"
    And they are not already friends
    When the user clicks "Add Friend"
    Then a Friendship record is created with status "pending"
    And "user-456" receives a notification

  Scenario: Accept a friend request
    Given "user-456" has a pending friend request from the user
    When "user-456" accepts the request
    Then the Friendship status changes to "accepted"
    And both users appear in each other's friend list

  Scenario: Block a user
    Given the user wants to block "user-789"
    When the user clicks "Block User"
    Then the Friendship status changes to "blocked"
    And "user-789" can no longer send messages or friend requests
```

#### US-016: Create and Manage a Club
> As a **club organizer**, I want to **create a club** so that **my local gaming group has a shared space on the platform**.

```gherkin
Feature: Club Management

  Scenario: Create a public club
    Given the user is authenticated
    When the user creates a club named "Iron Warriors Gaming" with isPublic=true
    Then a Club record is created
    And the user is assigned the "owner" role
    And the club appears in the public club directory

  Scenario: Join a public club
    Given the club "Iron Warriors Gaming" is public and has capacity
    When a player clicks "Join Club"
    Then a ClubMember record is created with role "member"
    And the member count increments

  Scenario: Club full
    Given the club "Iron Warriors Gaming" has 200 members
    When a player attempts to join
    Then the API returns a 409 Conflict
    And the response contains "Club is at maximum capacity"
```

#### US-017: Club Chat
> As a **club member**, I want to **chat with other club members** so that **we can coordinate games and discuss tactics**.

```gherkin
Feature: Club Chat

  Scenario: Send a message in club chat
    Given the user is a member of club "Iron Warriors Gaming"
    And the user is connected to the club chat WebSocket
    When the user sends "Anyone up for a 2000pt game tonight?"
    Then all connected club members receive the message in real time
    And the message is persisted in Firestore

  Scenario: Abusive message is blocked
    Given the user sends a message containing flagged content
    When the message is scanned by Cloud NLP
    Then the message is not delivered to other members
    And the sender receives a warning
```
