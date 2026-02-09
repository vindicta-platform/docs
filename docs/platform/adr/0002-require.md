# 2. Require AI-assisted coding for platform development

Date: 2026-02-05

## Status

Accepted

## Context

The Vindicta Platform's 6-week roadmap (Feb 4 - Mar 17, 2026) has aggressive velocity targets:
- 20 repositories requiring coordinated development
- Week 1: Foundation scaffolds across 4 priority products (Agent-Auditor-SDK, WARScribe-Core, Primordia-AI, Vindicta-Portal)
- Week 6: v1.0 production releases for 3 products
- Daily schedule includes multiple PRs across repositories (e.g., Feb 4 had 4 PRs merged)

The platform architecture includes an agentic ecosystem with defined roles:
- **Senior Manager**: Orchestrates platform health and cross-team coordination
- **Agile Delivery Lead**: Executes `/adl-standup` and `/adl-pr-review` daily
- **Product Owner**: Manages `/po-sprint-planning` and `/po-roadmap-update`

These agents require AI coding capabilities to execute their workflows autonomously.

Additionally, the Platform Constitution mandates:
- **Article II**: Gemini as the AI engine (Gas Tank Model)
- **Article XVI**: Async-First development for LLM orchestrations
- **Agent-Auditor-SDK**: Implements rate limiting and priority queuing for AI requests

**Question**: Given the roadmap velocity requirements and agentic architecture, should AI-assisted coding be mandatory?

## Decision

**AI-assisted coding is REQUIRED for all Vindicta Platform development.**

All development work MUST use approved AI coding tools:
- **Antigravity** (primary AI coding assistant)
- **GitHub Copilot** (code completion and reviews)
- **Agent-Auditor-SDK** (agentic task orchestration)
- **Gemini AI Studio** (direct API access for agents)

### Enforcement Mechanisms

1. **Rate Limiting**: Agent-Auditor-SDK `RateLimiter` class enforces Gemini free tier limits (60 RPM, 60K TPM)
2. **Gas Tank Model**: AI requests MUST call `acquire()` before API calls, respecting quota limits
3. **Priority Queue**: Human requests prioritized over agent background work
4. **Cost Controls**: Operations stop immediately when quota exhausted (Constitution I compliance)

## Consequences

### Positive

- ✅ **Enables 6-week roadmap delivery**: Manual development cannot achieve required velocity
- ✅ **Supports agent workflows**: ADL/PO/SM agents can execute autonomously
- ✅ **Parallelizes development**: Multiple PRs per day across repositories (demonstrated in Week 1 with 6 PRs merged)
- ✅ **Free tier compliant**: Rate limiting prevents quota overages
- ✅ **Consistent with architecture**: Leverages Agent-Auditor-SDK and Gemini API

### Negative

- ⚠️ **API quota dependency**: Platform velocity limited by Gemini free tier (mitigated by rate limiting)
- ⚠️ **Agent maturity risk**: Requires Agent-Auditor-SDK stability (Week 1 PR #12 completed this)
- ⚠️ **Learning curve**: Developers must adopt AI-first workflows (addressed by agent AGENT.md documentation)

### Neutral

- Agent workflows become the default interaction model
- Human intervention required for architecture reviews and release approvals
- Manual development remains possible but discouraged

## Alternatives Considered

### Alternative 1: No AI Assistance (Manual Only)

**Rationale**: Maximum human control, zero AI costs

**Rejected because**:
- Cannot meet 6-week timeline
- Single-threaded development (no parallelization)
- Invalidates agentic ecosystem architecture
- Contradicts Constitution Article II (Gemini mandate)

### Alternative 2: Optional AI Assistance

**Rationale**: Flexibility for developers, can be enabled per-project

**Rejected because**:
- Inconsistent velocity across repositories
- Schedule uncertainty
- Undermines agent autonomy
- Doesn't leverage platform architecture

## Compliance

| Constitution Article | How This Decision Complies |
|----------------------|----------------------------|
| I. Economic Prime Directive | Free tier enforced via `RateLimiter` (60 RPM/TPM limits) |
| II. Gas Tank Model | `acquire()` method implements gas tank for Gemini API |
| III. Spec-Driven Methodology | Specs remain human-authored; code AI-generated from specs |
| V. Agentic Rights & Responsibilities | Formalizes AI assistants as first-class development participants |
| XVI. Async-First Mandate | AI tools enable concurrent development across repositories |

## Implementation

Week 1 demonstrated successful AI-assisted development:
- **6 PRs merged** in 2 days (Feb 4-5)
- **Agent-Auditor-SDK PR #12**: Rate limiting prevents 429 errors
- **WARScribe-Core PR #8**: Edition abstraction with tests
- **Primordia-AI PR #6**: DuckDB schema implementation
- **Vindicta-Portal PR #21, #22**: Firebase config + design tokens
- **Platform-Docs PR #2**: Branding updates

All implementations approved by architecture review with 100% Constitution compliance.

## References

- [Platform Constitution v2.7.0](file:///.specify/memory/constitution.md)
- [Agent-Auditor-SDK Rate Limiter PR #12](https://github.com/vindicta-platform/Agent-Auditor-SDK/pull/12)
- [Architecture Review - Week 1](file:///C:/Users/bfoxt/.gemini/antigravity/brain/15a9e296-a3eb-4686-89ec-bdd29f3b1d67/architecture_review_week1.md)
- [6-Week Roadmap Schedule](https://github.com/vindicta-platform/.github/blob/main/ROADMAP.md)
- [Agent Team Charter v2.1](https://github.com/vindicta-platform/Vindicta-Agents/blob/main/agents/shared/TEAM_CHARTER.md)
