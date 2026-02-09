# feat-014: Achievement & Progression System

> **Status**: Proposed  
> **Target Repos**: `Economy-Engine`, `Vindicta-API`, `Vindicta-Portal`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The platform has **no gamification layer** to reward engagement. This proposal introduces an Achievement & Progression system with XP, levels, badges, and milestones — integrated with the Economy-Engine for reward distribution.

### 2. System Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Domain      │────▶│  Achievement     │────▶│  Economy    │
│  Events      │     │  Engine          │     │  Engine     │
└──────────────┘     └────────┬─────────┘     └──────────────┘
                          │
                   ┌──────▼────────┐
                   │  Firestore     │
                   │  (Progress)    │
                   └───────────────┘
```

**Components**:
- **Achievement Engine**: Event-driven service that listens for domain events and evaluates achievement conditions.
- **XP Calculator**: Module in Economy-Engine that converts actions to XP and manages level thresholds.
- **Profile UI**: Achievement showcase on user profiles with badge gallery and progress bars.

### 3. Data Model

#### New Entities

| Entity | Fields |
|---|---|
| `Achievement` | `id`, `name`, `description`, `icon`, `category`, `condition`, `xpReward`, `rarity` |
| `UserProgress` | `userId`, `xp`, `level`, `unlockedAchievements[]`, `streaks` |
| `AchievementUnlock` | `userId`, `achievementId`, `unlockedAt`, `triggerEventId` |

#### Achievement Categories

| Category | Examples |
|---|---|
| **Combat** | "First Blood" (run 1st simulation), "Veteran" (100 simulations) |
| **Social** | "Team Player" (join a club), "Popular" (50 friends) |
| **Collector** | "Army Builder" (import 10 army lists), "Multi-faction" (5 different factions) |
| **Competitive** | "Champion" (win a tournament), "Streak" (5 wins in a row) |
| **Explorer** | "Meta Analyst" (view 50 comparisons), "Data Scientist" (export analytics 10 times) |

#### XP & Level System

| Level | XP Required | Title |
|---|---|---|
| 1-5 | 0-500 | Recruit |
| 6-15 | 500-5,000 | Battle Brother |
| 16-30 | 5,000-25,000 | Veteran |
| 31-50 | 25,000-100,000 | Commander |
| 50+ | 100,000+ | Chapter Master |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/achievements` | List all achievements |
| `GET` | `/users/:id/progress` | Get user's XP, level, and achievements |
| `GET` | `/users/:id/achievements` | Get user's unlocked achievements |
| `GET` | `/leaderboard/xp` | XP leaderboard |

### 4. Security & Scalability

- **Anti-Cheat**: Achievements can only be unlocked by verified server-side events (not client claims).
- **Idempotency**: Duplicate trigger events do not grant double XP or re-unlock achievements.
- **Performance**: Achievement evaluation is asynchronous (event queue); does not block the triggering action.
- **Extensibility**: New achievements added via configuration (Firestore document); no code deploy needed.

### 5. Assumptions

1. Economy-Engine manages the XP/currency system; Achievement Engine is a consumer.
2. Achievement unlock notifications use the push notification system (feat-005).
3. Rarity tiers (Common, Rare, Epic, Legendary) are based on unlock percentage across all users.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-028: Unlock an Achievement
> As a **player**, I want to **earn achievements for my actions** so that **I feel rewarded for engaging with the platform**.

```gherkin
Feature: Achievement System

  Scenario: Unlock "First Blood" achievement
    Given the user has never run a simulation
    When the user completes their first simulation
    Then the "First Blood" achievement is unlocked
    And the user receives 100 XP
    And a push notification is sent: "Achievement Unlocked: First Blood!"

  Scenario: Duplicate event does not re-unlock
    Given the user already has the "First Blood" achievement
    When the user completes another simulation
    Then the "First Blood" achievement is not unlocked again
    And XP for the simulation action is still awarded

  Scenario: Level up
    Given the user has 490 XP (Level 4)
    When the user earns 20 XP from an achievement
    Then the user's XP becomes 510
    And the user levels up to Level 6 ("Battle Brother")
    And a level-up notification is sent
```

#### US-029: View Achievement Showcase
> As a **player**, I want to **view my achievements on my profile** so that **I can show off my progress to friends**.

```gherkin
Feature: Achievement Profile

  Scenario: View own achievements
    Given the user has unlocked 12 achievements
    When the user visits their profile page
    Then the achievement gallery displays 12 unlocked badges
    And locked achievements are shown as greyed-out silhouettes
    And the progress bar shows current XP toward next level

  Scenario: View another player's achievements
    Given user "user-456" has a public profile
    When the user views "user-456"'s profile
    Then their achievement badges and level are visible
    And the user can compare achievements side-by-side
```
