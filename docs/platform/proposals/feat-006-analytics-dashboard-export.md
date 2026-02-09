# feat-006: Analytics Dashboard & Data Export

> **Status**: Proposed  
> **Target Repos**: `Vindicta-Portal`, `Meta-Oracle`, `Vindicta-API`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

Meta-Oracle generates powerful analytical data about faction performance, meta shifts, and win rates — but there is **no user-facing dashboard** and **no data export capability**. This proposal introduces an interactive analytics dashboard in the Portal and export functionality for CSV, PDF, and JSON formats.

### 2. System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dashboard   │────▶│  Analytics   │────▶│  Meta-Oracle │
│  (Chart.js)  │     │  API         │     │  (Engine)    │
└──────────────┘     └─────┬────────┘     └──────────────┘
                          │
                   ┌──────▼────────┐
                   │  Export       │
                   │  Service      │
                   │  (CSV/PDF/JSON)│
                   └───────────────┘
```

**Components**:
- **Analytics API**: Aggregation endpoints wrapping Meta-Oracle queries with date ranges, filters, and grouping.
- **Dashboard UI**: Interactive charts (Chart.js/D3.js) for win rates, faction popularity, meta trends.
- **Export Service**: Server-side rendering for PDF (via Puppeteer), CSV (streaming), and raw JSON.

### 3. Data Model

#### Analytics Query Schema

```json
{
  "metric": "win_rate",
  "groupBy": "faction",
  "dateRange": { "from": "2026-01-01", "to": "2026-02-07" },
  "filters": { "pointsLimit": 2000, "format": "matched_play" }
}
```

#### Dashboard Widgets

| Widget | Chart Type | Data Source |
|---|---|---|
| Faction Win Rates | Bar chart | Meta-Oracle aggregation |
| Meta Trend Timeline | Line chart | Meta-Oracle time series |
| Popular Army Compositions | Treemap | WARScribe-Parser stats |
| Simulation Distribution | Histogram | Dice-Engine results |
| Player Leaderboard | Table | Tournament standings |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/analytics/query` | Execute an analytics query |
| `GET` | `/analytics/dashboards` | Get saved dashboard configurations |
| `POST` | `/analytics/export` | Export query results (format in body) |
| `GET` | `/analytics/presets` | Get preset query templates |

### 4. Security & Scalability

- **Query Limits**: Max date range of 1 year; max 10 concurrent queries per user.
- **Caching**: Analytics results cached for 15 minutes (configurable via `Quota-Manager`).
- **PDF Generation**: Asynchronous with webhook callback on completion (prevents request timeout).
- **Data Access**: Analytics data is anonymized; no PII exposed in aggregations.

### 5. Assumptions

1. Chart.js is the preferred charting library (lightweight, works with static hosting).
2. PDF export uses headless Chromium (Puppeteer) running as a Cloud Function.
3. Meta-Oracle already stores aggregated stats; no new data pipeline needed.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-013: View Analytics Dashboard
> As a **player**, I want to **view faction win rates on a dashboard** so that **I can understand the current competitive meta**.

```gherkin
Feature: Analytics Dashboard

  Scenario: View faction win rates
    Given the user navigates to the analytics dashboard
    When the page loads with default settings (last 30 days, all factions)
    Then a bar chart displays win rates for all factions
    And each bar is labeled with the faction name and percentage
    And the chart is interactive (hover shows tooltip with match count)

  Scenario: Filter by date range
    Given the user is on the analytics dashboard
    When the user selects date range "2026-01-01" to "2026-01-31"
    Then the charts update to reflect only data from January 2026
    And the loading indicator is shown during data fetch
```

#### US-014: Export Analytics Data
> As a **content creator**, I want to **export meta data as CSV** so that **I can create custom visualizations for my YouTube channel**.

```gherkin
Feature: Data Export

  Scenario: Export win rates as CSV
    Given the user has an active analytics query showing faction win rates
    When the user clicks "Export as CSV"
    Then a CSV file is downloaded with columns: Faction, WinRate, MatchCount, DateRange
    And the file name includes the current date

  Scenario: Export dashboard as PDF
    Given the user is viewing the analytics dashboard
    When the user clicks "Export as PDF"
    Then a background job is created for PDF generation
    And the user receives a notification when the PDF is ready
    And the PDF contains rendered versions of all visible charts
```
