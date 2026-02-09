# feat-009: Progressive Web App (PWA) Shell

> **Status**: Proposed  
> **Target Repos**: `Vindicta-Portal`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The Vindicta Portal is a static HTML site with **no mobile optimization** and **no offline capability**. This proposal transforms the Portal into a fully installable **Progressive Web App** (PWA) with offline support, home screen installation, and push notification integration.

### 2. System Architecture

```
┌─────────────────────────────────────────┐
│           PWA Shell (Vindicta-Portal)     │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Service   │  │  App        │  │  Web App │  │
│  │  Worker   │  │  Manifest   │  │  Manifest│  │
│  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────┘
```

**Components**:
- **Service Worker**: Caches static assets (HTML, CSS, JS, images) for offline access; implements stale-while-revalidate strategy for API data.
- **Web App Manifest**: `manifest.json` with app name, icons, theme color, and display mode.
- **Responsive Layout**: Mobile-first CSS grid with breakpoints for tablet and desktop.

### 3. Data Model

#### manifest.json

```json
{
  "name": "Vindicta Platform",
  "short_name": "Vindicta",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#e94560",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### Service Worker Caching Strategy

| Resource Type | Strategy | TTL |
|---|---|---|
| HTML pages | Network-first, cache fallback | 24h |
| CSS/JS bundles | Cache-first, background revalidate | 7d |
| Images/icons | Cache-first | 30d |
| API responses | Stale-while-revalidate | 5min |
| Replay files | Cache on demand | Until evicted |

#### Offline Capabilities

| Feature | Offline Support |
|---|---|
| Browse army lists | ✅ (cached) |
| View saved replays | ✅ (cached on demand) |
| View analytics dashboard | ✅ (stale data) |
| Run new simulation | ❌ (requires server) |
| Chat | ❌ (requires WebSocket) |

### 4. Security & Scalability

- **HTTPS Required**: Service workers require HTTPS (already provided by GCP hosting).
- **Cache Size**: Max 50MB local cache; LRU eviction policy.
- **Update Flow**: Service worker checks for updates every 24 hours; user prompted to refresh.
- **Lighthouse Target**: Score ≥90 on Performance, Accessibility, Best Practices, SEO, and PWA.

### 5. Assumptions

1. The Portal is already served over HTTPS via GCP Cloud Storage + CDN.
2. App icons will be generated as part of this feature's implementation.
3. iOS Safari PWA limitations (no push notifications, limited Service Worker lifecycle) are accepted for v1.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-020: Install PWA
> As a **mobile user**, I want to **install Vindicta to my home screen** so that **it feels like a native app**.

```gherkin
Feature: PWA Installation

  Scenario: Install prompt on mobile
    Given the user visits the Portal on a mobile browser
    And the PWA criteria are met (HTTPS, manifest, service worker)
    When the browser triggers the "beforeinstallprompt" event
    Then a custom install banner is displayed
    And tapping "Install" adds the app to the home screen

  Scenario: Launch from home screen
    Given the user has installed the PWA
    When the user taps the Vindicta icon on their home screen
    Then the app opens in standalone mode (no browser chrome)
    And the splash screen shows the Vindicta logo
```

#### US-021: Offline Access
> As a **player on a train**, I want to **view my saved army lists offline** so that **I can review my roster without internet**.

```gherkin
Feature: Offline Access

  Scenario: View cached army lists offline
    Given the user has previously viewed their army lists while online
    And the device is now offline
    When the user opens the army lists page
    Then the cached army lists are displayed
    And a banner indicates "You are offline — data may be outdated"

  Scenario: Graceful degradation for server-dependent features
    Given the device is offline
    When the user attempts to run a new simulation
    Then a message is displayed: "Simulation requires an internet connection"
    And the user is not shown an error page
```
