# Installation

Detailed installation instructions for each platform component.

---

## Core Requirements

All Vindicta components require:

- **Python 3.10+** (for backend components)
- **Node.js 18+** (for UI components)
- **uv** (recommended package manager)

### Installing uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

## Component Installation

### Platform Core

The central integration layer:

```bash
git clone https://github.com/vindicta-platform/platform-core.git
cd platform-core
uv venv
uv pip install -e ".[dev]"
```

### Individual Modules

Each module can be installed independently:

```bash
# Dice Engine
uv pip install git+https://github.com/vindicta-platform/Dice-Engine.git

# Economy Engine
uv pip install git+https://github.com/vindicta-platform/Economy-Engine.git

# Meta-Oracle
uv pip install git+https://github.com/vindicta-platform/Meta-Oracle.git

# WARScribe Core
uv pip install git+https://github.com/vindicta-platform/WARScribe-Core.git
```

### Logi-Slate UI

```bash
git clone https://github.com/vindicta-platform/Logi-Slate-UI.git
cd Logi-Slate-UI
npm install
npm run dev
```

---

## Verification

Verify your installation:

```bash
# Check CLI
vindicta --version

# Check API
curl http://localhost:8000/health

# Run tests
pytest tests/ -v
```

---

## Troubleshooting

### uv lock file issues

```bash
uv cache clean
rm uv.lock
uv sync
```

### Port already in use

```bash
# Find process on port 8000
lsof -i :8000
# or on Windows
netstat -ano | findstr :8000
```
