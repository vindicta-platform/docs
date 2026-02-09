# feat-003: Multi-format Army List Import/Export

> **Status**: Proposed  
> **Target Repos**: `WARScribe-Parser`, `Vindicta-API`, `Vindicta-Portal`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The WARScribe-Parser currently supports the proprietary Wargame Notation System (WNS) format only. This proposal adds a **pluggable format adapter system** to support importing and exporting army lists in BattleScribe (`.rosz`), Wahapedia JSON, New Recruit CSV, and plain-text TTS formats.

### 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  WARScribe-Parser                    │
│  ┌─────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │ Format  │  │ Canonical │  │ Format            │  │
│  │ Adapter │─▶│ Army List │─▶│ Exporter          │  │
│  │ Registry│  │ Model     │  │ Registry          │  │
│  └─────────┘  └───────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Adapter Pattern**: Each format implements the `FormatAdapter` interface:

```python
class FormatAdapter(ABC):
    @abstractmethod
    def detect(self, raw: bytes) -> bool: ...
    
    @abstractmethod
    def parse(self, raw: bytes) -> CanonicalArmyList: ...
    
    @abstractmethod
    def export(self, army: CanonicalArmyList) -> bytes: ...
    
    @property
    @abstractmethod
    def format_id(self) -> str: ...
```

### 3. Data Model

#### Canonical Army List Schema

```python
@dataclass
class CanonicalArmyList:
    name: str
    faction: str
    points_limit: int
    detachments: list[Detachment]
    metadata: dict  # source format, version, author

@dataclass
class Detachment:
    name: str
    type: str  # e.g., "Patrol", "Battalion"
    units: list[Unit]

@dataclass
class Unit:
    name: str
    models: int
    points: int
    wargear: list[str]
    keywords: list[str]
```

#### Supported Formats

| Format | Extension | Import | Export |
|---|---|---|---|
| WNS (native) | `.wns` | ✅ | ✅ |
| BattleScribe | `.rosz` | ✅ | ✅ |
| Wahapedia JSON | `.json` | ✅ | ❌ |
| New Recruit CSV | `.csv` | ✅ | ✅ |
| TTS Plain Text | `.txt` | ✅ | ✅ |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/armies/import` | Upload and parse an army list file |
| `GET` | `/armies/:id/export?format=rosz` | Export army in specified format |
| `GET` | `/armies/formats` | List supported formats |

### 4. Security & Scalability

- **File Validation**: Max upload size 5MB; content-type validation; ZIP bomb detection for `.rosz`.
- **Sandboxed Parsing**: Each parse operation runs with a 10-second timeout.
- **Caching**: Parsed canonical forms cached in Firestore for 24 hours.
- **Extensibility**: New formats registered via entry points (`setuptools`); no core code changes needed.

### 5. Assumptions

1. BattleScribe `.rosz` format is a ZIP archive containing XML (reverse-engineered; no official spec).
2. Wahapedia JSON is read-only import (their API does not accept writes).
3. Canonical model covers 95%+ of unit configurations across supported game systems.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-006: Import BattleScribe Army List
> As a **player**, I want to **import my BattleScribe army list** so that **I can run simulations without re-entering my roster manually**.

```gherkin
Feature: Army List Import

  Scenario: Import a valid BattleScribe file
    Given the user has a BattleScribe file "space_marines.rosz"
    When the user uploads it to POST /armies/import
    Then the API returns a 201 with the canonical army list
    And the army contains the correct faction "Adeptus Astartes"
    And all units match the source file's point values

  Scenario: Import fails for unsupported format
    Given the user has a file "army.xlsx"
    When the user uploads it to POST /armies/import
    Then the API returns a 415 Unsupported Media Type
    And the response lists supported formats

  Scenario: Import fails for corrupted file
    Given the user has a corrupted BattleScribe file
    When the user uploads it to POST /armies/import
    Then the API returns a 422 Unprocessable Entity
    And the response contains "Failed to parse army list"
```

#### US-007: Export Army List
> As a **player**, I want to **export my army list to BattleScribe format** so that **I can share it with friends who use that app**.

```gherkin
Feature: Army List Export

  Scenario: Export to BattleScribe format
    Given the user has a saved army list "army-456"
    When the user requests GET /armies/army-456/export?format=rosz
    Then the API returns a 200 with content-type "application/zip"
    And the downloaded file is a valid BattleScribe .rosz archive

  Scenario: Export to unsupported format
    Given the user has a saved army list "army-456"
    When the user requests GET /armies/army-456/export?format=pdf
    Then the API returns a 400 Bad Request
    And the response contains "Format 'pdf' is not supported for export"
```
