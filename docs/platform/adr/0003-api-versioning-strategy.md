# 3. API Versioning Strategy for Vindicta Platform

Date: 2026-02-05

## Status

Proposed

## Context

The Vindicta Platform API (Vindicta-API) is being designed to serve multiple frontend clients (Vindicta-Portal, Logi-Slate-UI) and external integrations. The API will evolve over time as new features are added and requirements change.

**Question**: How should we version the API to ensure:
- Backward compatibility for existing clients
- Clear deprecation policies
- Minimum disruption to users
- Alignment with REST best practices

## Decision

**We will use URL-based versioning with a major version number in the path: `/api/v{N}/`**

### Versioning Rules

1. **URL Structure**: All endpoints include major version: `/api/v1/army`, `/api/v2/meta`
2. **Breaking Changes**: Increment major version (v1 → v2) for:
   - Removing endpoints or fields
   - Changing response schemas incompatibly
   - Modifying authentication requirements
   - Altering rate limit behavior

3. **Non-Breaking Changes**: Keep same version for:
   - Adding new endpoints
   - Adding optional request parameters
   - Adding new response fields
   - Bug fixes and performance improvements

4. **Deprecation Policy**:
   - Old versions supported for **12 months** after new version release
   - Deprecation warnings in response headers: `Deprecation: true`, `Sunset: <date>`
   - 90-day notice before removal
   - Documentation updated immediately

5. **Free Tier vs Paid**:
   - Latest version (e.g., v2) available only to paid users initially
   - Previous version (e.g., v1) remains free tier
   - After 6 months, latest version becomes free tier

### Example Lifecycle

```
Feb 2026:  v1 released (free tier)
Aug 2026:  v2 released (paid only)
           v1 remains free, deprecated
Feb 2027:  v2 becomes free tier
           v1 removed (12-month support window expired)
```

## Consequences

### Positive

- ✅ **Clear expectations**: Clients know exactly which version they're using
- ✅ **No header parsing**: Version in URL is visible in logs and browser dev tools
- ✅ **Easy routing**: FastAPI can route by path prefix cleanly
- ✅ **Monorepo-friendly**: Old and new versions coexist in same codebase

### Negative

- ⚠️ **URL duplication**: Multiple versions mean duplicate endpoint paths
- ⚠️ **Maintenance burden**: Supporting 2 versions simultaneously for 12 months
- ⚠️ **Client migration**: Clients must update URLs (not just headers)

### Neutral

- Versioning strategy applies to **all** Vindicta Platform APIs (future microservices use same pattern)
- OpenAPI specs generated per version: `openapi-v1.yaml`, `openapi-v2.yaml`

## Alternatives Considered

### Alternative 1: Header-Based Versioning

**Approach**: Use `Accept: application/vnd.vindicta.v1+json` header

**Rejected because**:
- Harder to test (browsers don't show headers by default)
- More complex routing in FastAPI
- Users forget to set headers

### Alternative 2: Query Parameter Versioning

**Approach**: `/api/army?version=1`

**Rejected because**:
- Non-standard in REST APIs
- Easy to forget query params
- Caching becomes complex

### Alternative 3: No Versioning (Breaking Changes Only)

**Approach**: Single `/api/` prefix, breaking changes force all clients to upgrade

**Rejected because**:
- Violates Platform Constitution (no unauthorized disruption)
- Free tier users can't be forced to upgrade
- Doesn't support gradual migration

## Compliance

| Constitution Article | How This Decision Complies |
|----------------------|----------------------------|
| I. Economic Prime Directive | 12-month support window prevents forced free tier upgrades |
| III. Spec-Driven Methodology | OpenAPI specs versioned per major version |
| XVII. Repository Isolation | Each API version isolated in separate router modules |

## Implementation

### FastAPI Structure

```python
# src/vindicta_api/main.py
from fastapi import FastAPI
from vindicta_api.v1 import router as v1_router
# Future: from vindicta_api.v2 import router as v2_router

app = FastAPI()
app.include_router(v1_router, prefix="/api/v1")
# app.include_router(v2_router, prefix="/api/v2")
```

### Version 1 (Current)

- **Release**: Week 6 (Mar 15,2026)
- **Target**: v1.0.0 with /army, /game, /meta endpoints
- **Free Tier**: Yes

### Deprecation Process

1. **90 days before sunset**: Add `Deprecation` header to all v1 responses
2. **documentation update**: Mark v1 endpoints as deprecated in OpenAPI spec
3. **Client notification**: Email all registered users with migration guide
4. **Sunset date**: Remove v1 code after 12-month support window

## References

- [OpenAPI 3.0 Spec](file:///c:/Users/bfoxt/vindicta-platform/Vindicta-API/docs/openapi.yaml)
- [REST API Versioning Best Practices](https://restfulapi.net/versioning/)
- [Platform Constitution v2.7.0](file:///.specify/memory/constitution.md)
- [Vindicta-API README](file:///c:/Users/bfoxt/vindicta-platform/Vindicta-API/README.md)
