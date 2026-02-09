# Quick Start

Get Vindicta running in 5 minutes.

---

## Prerequisites

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip
- A terminal

## Option 1: CLI (Recommended)

The fastest way to start is with the unified CLI:

```bash
# Install the CLI
uv pip install git+https://github.com/vindicta-platform/Vindicta-CLI.git

# Check installation
vindicta --version

# Roll some dice
vindicta dice roll 2d6

# Validate an army list
vindicta warscribe validate mylist.json
```

## Option 2: Local API Server

Run the full platform locally:

```bash
# Clone the platform core
git clone https://github.com/vindicta-platform/platform-core.git
cd platform-core

# Install dependencies
uv venv
uv pip install -e ".[dev]"

# Start the server
uvicorn vindicta.api:app --reload

# API is now at http://localhost:8000
# Docs at http://localhost:8000/docs
```

## Option 3: UI Only

For the visual experience:

```bash
git clone https://github.com/vindicta-platform/Logi-Slate-UI.git
cd Logi-Slate-UI
npm install
npm run dev

# Open http://localhost:3000
```

---

## Next Steps

- [Installation Guide](installation.md) — Detailed setup instructions
- [Your First Match](first-match.md) — Record a game step by step
- [Army Management](../features/army-management.md) — Build and validate lists
