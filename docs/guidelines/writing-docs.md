# Writing Documentation

This guide outlines the standards for contributing to the Vindicta Platform documentation.

## Structure

- **Platform Docs**: High-level architecture, features, and policies live in `docs/platform/`.
- **Component Docs**: specific documentation lives in the `docs/` folder of each repository (e.g., `Vindicta-API/docs/`).

## Format

We use [Markdown](https://www.markdownguide.org/) for all documentation.

### Frontmatter

Avoid using Jekyll-style frontmatter unless specifically required by a plugin.

### Headings

Use sentence case for headings.
- H1 (`#`) for the page title (one per page).
- H2 (`##`) for major sections.
- H3 (`###`) for subsections.

## Diagrams

Use [Mermaid](https://mermaid.js.org/) for diagrams.

\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\`

## Linking

- **Internal Links**: Use relative paths (e.g., `[Link](../another-page.md)`).
- **Cross-Repo Links**: When linking between submodules, remember that they are aggregated. Use the full path from the root of the site if possible, or relative paths traversing up to the root.
