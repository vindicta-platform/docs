# Cost Model

Free Tier sustainability through the Gas Tank model.

---

## The Economic Prime Directive

> The Vindicta Platform MUST run on GCP Free Tier. No standing monthly costs.

## Gas Tank Model

Every operation consumes "gas" (credits):

| Operation | Cost |
|-----------|------|
| API call | 1 credit |
| Dice roll | 0.1 credits |
| AI prediction | 10 credits |
| Data ingestion | 5 credits |

New users start with a free allocation. Credits replenish daily.

## Cost Control

The platform enforces:

- **Hard limits** — Operations fail when credits exhausted
- **Soft warnings** — Alerts when balance is low
- **No debt** — Never accrue negative balance

## Quota-Aware Scheduling

Background tasks use surplus quota:

```
Human Request Priority: ALWAYS FIRST
Background Priority: Uses remaining quota
Human Reserve: 50% always reserved
```

---

## Self-Hosting

Self-hosted deployments can configure:

- Custom credit allocations
- Unlimited mode (no limits)
- Custom pricing tiers
