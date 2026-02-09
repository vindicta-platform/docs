# Your First Match

Learn to record a game from start to finish.

---

## Before You Start

You'll need:

- An army list (in WARScribe format or JSON)
- Your opponent's list (or a proxy)
- Vindicta CLI or the Logi-Slate UI

## Step 1: Validate Your List

Before the game, ensure your list is legal:

=== "CLI"
    ```bash
    vindicta warscribe validate my-list.json
    ```

=== "UI"
    1. Open Logi-Slate
    2. Go to **Army Lists** → **Import**
    3. Upload or paste your list
    4. Click **Validate**

## Step 2: Start a Match

=== "CLI"
    ```bash
    vindicta match new \
      --player-list my-list.json \
      --opponent-list opponent.json \
      --mission "Purge the Enemy"
    ```

=== "UI"
    1. Click **New Match**
    2. Select your list and opponent's list
    3. Choose mission and deployment
    4. Click **Start**

## Step 3: Track Each Turn

As the game progresses, log key events:

- **Primary Scoring** — Objectives held
- **Secondary Scoring** — Points earned
- **Unit Actions** — Charges, fights, shooting phases
- **Casualties** — Units destroyed

## Step 4: End the Game

When the game ends:

=== "CLI"
    ```bash
    vindicta match end --winner player
    ```

=== "UI"
    1. Click **End Match**
    2. Verify scores
    3. Click **Confirm**

## Step 5: Review

After the match, review your performance:

- Win rate by mission type
- Unit efficiency statistics  
- Comparison to meta averages

---

## Next Steps

- [Match Tracking Features](../features/match-tracking.md)
- [Meta Analysis](../features/meta-analysis.md)
