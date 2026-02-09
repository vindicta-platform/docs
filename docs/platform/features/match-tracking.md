# Match Tracking

Record games and analyze your performance.

---

## Overview

Track every game from deployment to final score. Vindicta records key moments and generates statistics to improve your play.

## Creating a Match

Start a new match with:

```bash
vindicta match new \
  --player-list my-list.json \
  --opponent-list opponent.json \
  --mission "Purge the Enemy" \
  --deployment "Dawn of War"
```

Or through the UI:

1. **New Match** → Select lists
2. Choose mission and deployment
3. Click **Start**

## Turn-by-Turn Tracking

Log each turn's key events:

### Scoring

```bash
vindicta match score \
  --turn 2 \
  --primary 15 \
  --secondary "Assassinate:4,Engage:3"
```

### Key Events

Record critical moments:

- Unit destroyed
- Charge declared
- Stratagem used
- Battle shock failed

## After the Game

### Match Summary

View the complete game:

```bash
vindicta match summary <match-id>
```

### Statistics

Vindicta tracks:

- **Win rate** by mission type
- **Average VP** per game
- **Unit performance** (kills, damage, survival)
- **Faction matchups**

---

## Match History

Access your full match history:

```bash
vindicta match list --last 10
```

Filter by faction, mission, or date range.
