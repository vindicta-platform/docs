# feat-010: Redis Caching & CDN Layer

> **Status**: Proposed  
> **Target Repos**: `Vindicta-API`, `Vindicta-Core`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The Vindicta API currently has **no caching layer** — every request hits the database directly. As user growth accelerates, this becomes a scalability bottleneck. This proposal introduces a **Redis caching layer** for frequently accessed data and a **CDN strategy** for static and semi-static assets.

### 2. System Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌─────────────┐
│ Client   │────▶│  Cloud CDN   │────▶│  API    │────▶│  Redis       │
│          │     │  (Static)    │     │  Server │     │  (Memorystore)│
└──────────┘     └──────────────┘     └────┬────┘     └─────────────┘
                                          │
                                   ┌──────▼────────┐
                                   │   Firestore    │
                                   │   (Source of   │
                                   │    Truth)      │
                                   └───────────────┘
```

**Components**:
- **Redis (GCP Memorystore)**: In-memory cache for hot data (leaderboards, active tournament standings, session data).
- **Cache Middleware**: Express.js middleware that checks Redis before hitting Firestore.
- **Cache Invalidation**: Event-driven invalidation via Pub/Sub when source data changes.
- **Cloud CDN**: Caches static Portal assets, API responses with `Cache-Control` headers.

### 3. Data Model

#### Cache Key Schema

```
vindicta:{entity}:{id}:{version}
```

Examples:
- `vindicta:army:army-456:v3`
- `vindicta:tournament:GT-2026:standings`
- `vindicta:meta:faction-winrates:2026-02`

#### Caching Policy

| Data Type | TTL | Invalidation Trigger |
|---|---|---|
| User profile | 30 min | Profile update |
| Army list | 1 hour | Army edit/delete |
| Tournament standings | 2 min | Match result submission |
| Meta-Oracle aggregations | 15 min | Scheduled recomputation |
| Static assets (CDN) | 7 days | Deploy pipeline |

#### Middleware Interface

```typescript
interface CacheConfig {
  keyPrefix: string;
  ttlSeconds: number;
  invalidateOn: string[];  // event names
  staleWhileRevalidate: boolean;
}
```

### 4. Security & Scalability

- **Memory Budget**: 1GB Memorystore instance (Basic tier); auto-scaled to 5GB on traffic thresholds.
- **Eviction Policy**: `allkeys-lru` to prevent OOM errors.
- **Cache Stampede Prevention**: Probabilistic early expiration (PER) to avoid thundering herd.
- **Encryption**: Redis connections use TLS; no sensitive PII cached (only aggregated/public data).
- **Monitoring**: Cache hit/miss ratio exposed via Cloud Monitoring; alert on hit rate < 80%.

### 5. Assumptions

1. GCP Memorystore for Redis is the managed solution (no self-hosted Redis).
2. Cache-aside pattern is used (application manages cache population).
3. CDN is already partially configured for Portal static hosting; this enhances it.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-022: Fast API Responses via Caching
> As a **player**, I want **API responses to load quickly** so that **the app feels responsive**.

```gherkin
Feature: API Response Caching

  Scenario: Cache hit for frequently accessed data
    Given the tournament standings for "GT-2026" are cached in Redis
    When the user requests GET /tournaments/GT-2026/standings
    Then the response is returned from cache within 10ms
    And the response includes "X-Cache: HIT" header

  Scenario: Cache miss with automatic population
    Given the army list "army-456" is not in cache
    When the user requests GET /armies/army-456
    Then the data is fetched from Firestore
    And the response is stored in Redis with TTL 3600s
    And the response includes "X-Cache: MISS" header

  Scenario: Cache invalidated on data change
    Given the army list "army-456" is cached in Redis
    When the user updates the army list via PUT /armies/army-456
    Then the cache entry is immediately invalidated
    And the next GET request fetches fresh data from Firestore
```

#### US-023: CDN for Static Assets
> As a **system operator**, I want **static assets served via CDN** so that **global users experience low latency**.

```gherkin
Feature: CDN Static Asset Delivery

  Scenario: Static assets served from CDN edge
    Given the user is in Europe and the origin server is US-Central
    When the user requests the Portal homepage
    Then CSS, JS, and image assets are served from the nearest CDN edge
    And the response time for static assets is under 50ms

  Scenario: CDN cache purged on deployment
    Given a new version of the Portal is deployed
    When the CI/CD pipeline completes
    Then the CDN cache is purged for updated assets
    And subsequent requests serve the new version
```
