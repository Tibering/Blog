# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moon Caffee (一个学习小站) — a personal blog & knowledge base built with **VuePress 2** + **vuepress-theme-plume**, deployed via **GitHub Actions** to **GitHub Pages** at `https://Tibering.github.io/Blog/`.

## Build & Dev Commands

```bash
pnpm docs:dev              # Start dev server (hot reload)
pnpm docs:dev-clean        # Start dev server (clean cache & temp)
pnpm docs:build            # Production build (clean cache & temp)
pnpm docs:preview          # Preview built site locally (http-server)
pnpm vp-update             # Update vuepress-theme-plume
```

Package manager: **pnpm** (v10.10.0). Node: `^20.19.0 || >=22.0.0`. Build output goes to `docs/.vuepress/dist/`.

## Architecture

```
docs/
├── .vuepress/
│   ├── config.ts          # VuePress config — base, bundler, theme (takes lower priority)
│   ├── plume.config.ts    # Theme config — navbar, profile, plugins (overrides config.ts)
│   ├── navbar.ts          # Navbar definition, imported by plume.config.ts
│   ├── collections.ts     # Sidebar/collection definitions
│   ├── client.ts          # Client-side enhancements
│   ├── public/            # Static assets (e.g. plume.png → /plume.png)
│   └── dist/              # Build output (deployed to GitHub Pages)
├── blog/                  # Blog posts (markdown, auto-discovered)
├── bookmarks/             # Bookmark pages
├── database/              # Database-related notes
├── translation/           # Translated articles (Database in Depth, etc.)
├── system design/         # System design notes
└── README.md              # Home page (hero layout)
```

- **base** is set to `/Blog/` in `config.ts` — must match the GitHub repo name for Pages deployment.
- Two config files exist: `config.ts` (lower priority, needs restart) and `plume.config.ts` (higher priority, hot-reload). Do NOT duplicate config keys between them.
- Theme docs: https://theme-plume.vuejs.press/config/intro/

## Git Remotes

| Name | URL |
|------|-----|
| origin | `https://github.com/Tibering/Blog.git` (GitHub Pages target) |
| gitcode | `https://gitcode.com/user236pai/Blog.git` (mirror) |

Push via SSH if HTTPS fails: `git remote set-url origin git@github.com:Tibering/Blog.git`

## CI/CD

`.github/workflows/docs.yml` — builds with pnpm and deploys `docs/.vuepress/dist` to GitHub Pages. Requires GitHub Pages **Source** to be set to **GitHub Actions** in repo Settings.

## Build Failure Checklist

VuePress/vite builds are sensitive to markdown content issues. Common errors and fixes:

### 1. Angle brackets treated as HTML tags
**Error**: `Element is missing end tag` at a generated `.html.vue` file.
**Cause**: Text like `<clinit>`, `<init>`, `<String>`, `<T>`, `<P1,Screw>` outside of code blocks gets parsed as raw HTML tags by Vue's template compiler.
**Fix**: Wrap in backticks: `` `<clinit>` ``, `` `<init>` ``.

### 2. Underscore inside HTML tags creates malformed emphasis
**Error**: `Element is missing end tag` in generated HTML, often near `_</a>`.
**Cause**: `_` is markdown emphasis syntax. When placed between `<a>` and `</a>` like `<a name="fn7">_</a>`, it creates `<em>` inside the anchor, but `</a>` closes before `</em>`.
**Fix**: Replace `_` footnote markers with `*`: `<a name="fn7">*</a>`.

### 3. Image syntax used for links
**Error**: `EISDIR: illegal operation on a directory`.
**Cause**: `![alt](#fragment)` uses image syntax (`![]()`) instead of link syntax (`[]()`). Vite resolves `#fragment` as a local file path.
**Fix**: Remove the `!`: `[*](#fn23)` instead of `![*](#fn23)`.

### 4. Broken image URLs treated as local paths
**Error**: `Could not load .../path/` or `ENOENT: no such file or directory`.
**Cause**: Image URLs missing protocol (`httpatomoreillycom...` instead of `http://atiomoreilly.com/...`) are resolved as relative paths.
**Fix**: Restore full URL or comment out the image reference.

### 5. Missing local images
**Error**: `ENOENT: no such file or directory` for a local image path.
**Fix**: Comment out the `![]()` line and add a placeholder comment. Images can be restored later.
