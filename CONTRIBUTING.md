# Contributing to Vindicta Platform Docs

This repository aggregates documentation from all Vindicta Platform repositories.

## How it Works

We use [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to pull in `docs/` folders from other repositories.

## Adding a New Repository

1.  **Ensure compatibility**: The target repository must have a `docs/` directory containing an `index.md`.
2.  **Add Submodule**:
    ```bash
    git submodule add https://github.com/vindicta-platform/<repo-name>.git docs/external/<repo-name>
    ```
3.  **Update Configuration**:
    Add the new section to `mkdocs.yml` under `nav`:
    ```yaml
    nav:
      - ...
      - New Component: external/<repo-name>/docs/index.md
    ```

## Updating Documentation

1.  **Modify Source**: Make changes in the individual repository's `docs/` folder and push them.
2.  **Update Submodule**:
    In this repository:
    ```bash
    cd docs/external/<repo-name>
    git pull origin main
    cd ../../..
    git add docs/external/<repo-name>
    git commit -m "Update docs for <repo-name>"
    ```

## Local Development

1.  Clone recursively:
    ```bash
    git clone --recursive https://github.com/vindicta-platform/docs
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Serve locally:
    ```bash
    mkdocs serve
    ```
