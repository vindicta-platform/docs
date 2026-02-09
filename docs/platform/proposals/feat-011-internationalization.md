# feat-011: Internationalization (i18n)

> **Status**: Proposed  
> **Target Repos**: `Vindicta-Portal`, `Logi-Slate-UI`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The platform is entirely **English-only**. Warhammer is a global hobby with strong communities in Germany, France, Spain, Japan, and Brazil. This proposal introduces a scalable i18n framework using `i18next` for the Portal and the Logi-Slate-UI component library.

### 2. System Architecture

```
┌─────────────────────────────────────────┐
│          i18n Architecture               │
│                                           │
│  ┌────────────┐   ┌─────────────────┐   │
│  │ Locale     │   │ Translation     │   │
│  │ Detector   │─▶│ Loader (lazy)   │   │
│  └────────────┘   └───────┬─────────┘   │
│                        │                  │
│               ┌────────▼──────────┐      │
│               │ /locales/          │      │
│               │   en/common.json   │      │
│               │   de/common.json   │      │
│               │   fr/common.json   │      │
│               │   es/common.json   │      │
│               │   ja/common.json   │      │
│               └───────────────────┘      │
└─────────────────────────────────────────┘
```

**Components**:
- **i18next Core**: Translation engine with namespace support and interpolation.
- **Locale Detector**: Browser language → URL param → cookie → fallback to `en`.
- **Lazy Loading**: Translation JSON files loaded on demand per namespace.
- **Logi-Slate-UI**: All component strings externalized to translation keys.

### 3. Data Model

#### Translation File Structure

```
/locales/
  en/
    common.json      # Shared UI strings
    dashboard.json   # Dashboard-specific
    tournament.json  # Tournament feature
  de/
    common.json
    dashboard.json
    tournament.json
  ...
```

#### Translation Key Convention

```json
{
  "nav.home": "Home",
  "nav.dashboard": "Dashboard",
  "army.import.title": "Import Army List",
  "army.import.dropzone": "Drag & drop your file here, or click to browse",
  "simulation.run": "Run Simulation",
  "simulation.result.wins": "{{count}} wins out of {{total}} simulations"
}
```

#### Supported Languages (v1)

| Code | Language | Coverage Target |
|---|---|---|
| `en` | English | 100% (source) |
| `de` | German | 100% |
| `fr` | French | 100% |
| `es` | Spanish | 100% |
| `ja` | Japanese | 90% |

### 4. Security & Scalability

- **Bundle Size**: Lazy loading ensures only active locale is loaded (~20KB per namespace).
- **Fallback Chain**: Missing key → `en` fallback → key name displayed (never blank UI).
- **RTL Support**: Reserved for future (Arabic, Hebrew); CSS logical properties used proactively.
- **Community Contributions**: Translation files can accept PRs from community translators.

### 5. Assumptions

1. `i18next` is the chosen library (mature, framework-agnostic, fits static site).
2. Professional translations for v1 launch; community contributions for subsequent languages.
3. Game-specific terms (faction names, unit names) remain in English globally.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-024: Switch Language
> As a **German-speaking player**, I want to **switch the interface to German** so that **I can navigate the platform in my native language**.

```gherkin
Feature: Language Switching

  Scenario: Auto-detect browser language
    Given the user's browser language is set to "de-DE"
    When the user visits the Portal for the first time
    Then the UI is displayed in German
    And the language selector shows "Deutsch" as active

  Scenario: Manual language switch
    Given the UI is currently in English
    When the user selects "Français" from the language picker
    Then all UI strings update to French without a page reload
    And the preference is saved in a cookie for future visits

  Scenario: Fallback for missing translation
    Given the UI is set to Japanese
    And the key "tournament.advanced_settings" has no Japanese translation
    Then the English translation is displayed as fallback
    And no error is shown to the user
```
