# feat-001: OAuth2 Authentication & Role-Based Access Control

> **Status**: Proposed  
> **Target Repos**: `Vindicta-API`, `Vindicta-Core`  
> **Author**: Unified Product Architect (UPA)  
> **Date**: 2026-02-07  

---

## Part A: Software Design Document (SDD)

### 1. Overview

The Vindicta Platform currently has **no authentication or authorization layer**. All API endpoints are publicly accessible. This proposal introduces OAuth2 with PKCE for user authentication and a Role-Based Access Control (RBAC) system for authorization.

### 2. System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Vindicta    │────▶│  Vindicta    │────▶│  Firebase Auth   │
│  Portal      │     │  API Gateway │     │  (Identity)      │
└──────────────┘     └──────┬───────┘     └──────────────────┘
                           │
                     ┌─────▼─────┐
                     │  RBAC     │
                     │  Middleware│
                     └───────────┘
```

**Integration Points**:
- `Vindicta-API`: New `/auth/*` route group; JWT validation middleware on all protected endpoints.
- `Vindicta-Core`: User entity added to the domain model; session management service.
- `Vindicta-Portal`: Login/Register UI components; token storage via `httpOnly` cookies.

### 3. Data Model

#### New Entities

| Entity | Fields | Storage |
|---|---|---|
| `User` | `uid`, `email`, `displayName`, `avatar`, `createdAt`, `lastLogin` | Firestore `users` collection |
| `Role` | `id`, `name`, `permissions[]` | Firestore `roles` collection |
| `UserRole` | `userId`, `roleId`, `grantedAt`, `grantedBy` | Firestore `user_roles` collection |

#### Predefined Roles

| Role | Permissions |
|---|---|
| `viewer` | Read public data, view own profile |
| `player` | Submit army lists, run simulations, view match history |
| `club_admin` | Manage club members, create tournaments |
| `platform_admin` | Full CRUD on all resources, manage roles |

#### API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account via email/password | Public |
| `POST` | `/auth/login` | Authenticate, return JWT | Public |
| `POST` | `/auth/logout` | Invalidate session | Authenticated |
| `GET` | `/auth/me` | Get current user profile | Authenticated |
| `POST` | `/auth/refresh` | Refresh access token | Authenticated |
| `GET` | `/admin/roles` | List all roles | `platform_admin` |
| `PUT` | `/admin/users/:uid/roles` | Assign role to user | `platform_admin` |

### 4. Security & Scalability

- **Token Format**: Firebase ID Tokens (JWT), validated server-side via Firebase Admin SDK.
- **Token Lifecycle**: Access tokens expire in 1 hour; refresh tokens in 30 days.
- **Rate Limiting**: Auth endpoints rate-limited to 5 requests/minute/IP via `Quota-Manager`.
- **Password Policy**: Minimum 8 characters, enforced by Firebase Auth.
- **Assumption**: Social login (Google, Discord) deferred to a follow-up proposal.

### 5. Assumptions

1. Firebase Auth is the chosen identity provider (aligns with existing GCP hosting).
2. JWT validation occurs at the API gateway level before reaching business logic.
3. Role hierarchy is flat (no role inheritance) in v1.

---

## Part B: Behavior Driven Development (BDD)

### User Stories

#### US-001: User Registration
> As a **new visitor**, I want to **create an account** so that **I can save my army lists and simulation results**.

```gherkin
Feature: User Registration

  Scenario: Successful registration with valid credentials
    Given the user is on the registration page
    And no account exists for "commander@vindicta.gg"
    When the user submits email "commander@vindicta.gg" and password "Str0ngP@ss!"
    Then a new User record is created in Firestore
    And the user receives a 201 response with a valid JWT
    And the user is assigned the "player" role by default

  Scenario: Registration fails with duplicate email
    Given an account already exists for "commander@vindicta.gg"
    When the user submits email "commander@vindicta.gg" and password "AnyPass123!"
    Then the API returns a 409 Conflict error
    And the response body contains "Email already registered"

  Scenario: Registration fails with weak password
    Given the user is on the registration page
    When the user submits email "new@vindicta.gg" and password "123"
    Then the API returns a 400 Bad Request error
    And the response body contains "Password must be at least 8 characters"
```

#### US-002: User Login
> As a **registered user**, I want to **log in** so that **I can access my personalized dashboard**.

```gherkin
Feature: User Login

  Scenario: Successful login
    Given the user has a registered account with email "commander@vindicta.gg"
    When the user submits valid credentials
    Then the API returns a 200 response with access and refresh tokens
    And the "lastLogin" field is updated in Firestore

  Scenario: Login fails with wrong password
    Given the user has a registered account
    When the user submits an incorrect password
    Then the API returns a 401 Unauthorized error
    And no tokens are issued

  Scenario: Login is rate-limited after repeated failures
    Given the user has failed login 5 times in 1 minute
    When the user attempts a 6th login
    Then the API returns a 429 Too Many Requests error
```

#### US-003: Role-Based Access
> As a **platform admin**, I want to **assign roles to users** so that **I can control access to sensitive operations**.

```gherkin
Feature: Role-Based Access Control

  Scenario: Admin assigns a role
    Given the authenticated user has the "platform_admin" role
    When the admin assigns the "club_admin" role to user "user-123"
    Then the UserRole record is created in Firestore
    And subsequent requests by "user-123" reflect the new permissions

  Scenario: Non-admin cannot assign roles
    Given the authenticated user has the "player" role
    When the user attempts to assign a role to another user
    Then the API returns a 403 Forbidden error

  Scenario: Viewer cannot access simulation endpoints
    Given the authenticated user has the "viewer" role
    When the user attempts to POST to "/simulations/run"
    Then the API returns a 403 Forbidden error
```
