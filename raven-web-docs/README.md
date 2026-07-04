# Raven Web Docs

Static documentation site for [Raven](../README.md), built with [Hugo](https://gohugo.io/) and the [Hugo Book](https://github.com/alex-shpak/hugo-book) theme (v11).

## Requirements

- [Hugo Extended](https://gohugo.io/installation/) **0.145+** (`brew install hugo` on macOS)
- Git (to install the theme once)

## First-time setup

```bash
cd raven-web-docs
./scripts/setup-theme.sh
```

This clones `hugo-book` v11 into `themes/hugo-book` (compatible with Hugo 0.145–0.157).

## Local preview

```bash
hugo server --disableFastRender
```

Open http://localhost:1313

## Production build

```bash
npm run build
# or: hugo --minify
```

Output is written to `public/`.

## Deploy on Vercel

1. Import the repo in [Vercel](https://vercel.com/new)
2. Set **Root Directory** to `raven-web-docs`
3. Framework preset: **Other** (Vercel reads `vercel.json` automatically)
4. Add custom domain `raven.nopejs.me` in Project → Settings → Domains

The build runs `npm run build`, which:

- Installs Hugo Extended 0.145 on Vercel’s Linux runners (if not already present)
- Clones the hugo-book theme via `scripts/setup-theme.sh`
- Builds with `--baseURL` from your Vercel production domain (or preview URL)

Optional env override:

```bash
HUGO_BASEURL=https://raven.nopejs.me/
```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "public"
}
```

No Node dependencies — `package.json` only defines the build script.

## Documentation sections

| Section | Contents |
|---------|----------|
| Getting started | Installation, quick start, dry-run walkthrough |
| Concepts | Architecture, Discover → Draft → Send pipeline |
| Commands | Full CLI reference (`discover`, `draft`, `send`, …) |
| Configuration | `portals.yml`, `profile.yml`, `.env` |
| Job discovery | Sources, filters, openjobdata index |
| Drafting | Resume parsing, JD tailoring, form guides, Gemini |
| Outreach | Email workflow |
| Reference | Logging, file layout, troubleshooting |

## Static assets

| File | Purpose |
|------|---------|
| `static/logo.png` | Brand logo (sidebar, OG image) |
| `static/favicon*.png` | Tab icon (16, 32, 96px) + Apple touch icon |
| `layouts/partials/docs/seo.html` | Meta tags, Open Graph, Twitter, JSON-LD |

## SEO

- `enableRobotsTXT` + `sitemap.xml` (auto-generated)
- Per-page `description` in front matter (falls back to site default)
- Open Graph + Twitter cards with logo
- JSON-LD structured data (WebSite / TechArticle)

## Project layout

```
raven-web-docs/
  hugo.toml           Site config
  go.mod              Placeholder (theme is vendored via setup script)
  scripts/
    setup-theme.sh    One-time theme install (also runs on Vercel build)
    build.sh          Production build (local + Vercel)
  package.json        npm run build entrypoint for Vercel
  vercel.json         Vercel deploy config
  content/docs/       Documentation pages (Markdown)
  assets/             Custom SCSS overrides
  themes/hugo-book/   Hugo Book theme (not committed — run setup-theme.sh)
  public/             Build output (gitignored)
```

## Hugo version note

- **Hugo 0.145–0.157:** use `./scripts/setup-theme.sh` (installs hugo-book v11)
- **Hugo 0.158+:** you may switch to hugo-book latest via Hugo Modules instead
