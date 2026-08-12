# The Neurodivergence Library

A calm, editorial web library of research and resources on neurodivergence —
whitepapers, clinical studies, worksheets and toolkits, curated to be
neuro-affirming and easy to read.

**Live site: https://adhd-irl.github.io/bodydouble/**

The site is fully static: no backend, no accounts, no data collection.

## Sections

- **Cutting-Edge Research** — featured emerging studies and neuro-affirming paradigms.
- **Emerging Diagnostics** — objective identification methods (EEG/qEEG, MRI, eye-tracking,
  polygenic scores, CPTs, digital phenotyping), each shown with its promise *and* its limits.
- **All resources** — the full collection, filterable by focus area.
- **Supplement Support** — plain-language, safety-first information on supplements
  sometimes explored alongside neurodivergence.

## Focus areas

ADHD & Executive Function · Autism & AuDHD · Monotropism & Double Empathy Problem ·
Sensory Processing & Interoception · High Giftedness & 2e (Twice Exceptional)

## Adding a resource (no code required)

1. Drop the file into [`public/downloads/`](public/downloads).
2. Append one object to the `resources` array in
   [`src/data/resources.json`](src/data/resources.json).

The card, the filter counts, and — if you set `"featured": true` — the
Cutting-Edge Research section all update automatically. The same file holds the
`supplements` and `diagnostics` arrays. Full field reference:
[`public/downloads/README.md`](public/downloads/README.md).

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run lint
```

Built with Vite, React, React Router, Tailwind CSS and shadcn/ui.

### Design system

The library's palette is a strict green-and-blue editorial theme — sage, deep
forest, coastal blue and seafoam on warm off-whites, deliberately avoiding pure
white backgrounds and pure black text to reduce visual strain. Tokens live under
`.rx-theme` in [`src/index.css`](src/index.css).

A **Sensory-Friendly** reading mode (persisted per visitor) switches to a lower
contrast, desaturated, calmer-motion variant; `prefers-reduced-motion` is also
honoured.

## Deployment

Published to GitHub Pages by
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) on
every push to `main` that touches the site, plus manual **Run workflow**
dispatches.

**One-time repository setup:** Settings → Pages → Build and deployment →
Source → **GitHub Actions**.

Because Pages serves the site from a repository sub-path, CI builds with
`PAGES_BASE=/<repo-name>/`. Routing uses `HashRouter`, since Pages has no SPA
rewrite and a path-based deep link would otherwise 404.

Preview the sub-path build locally:

```bash
npm run build:pages
npm run preview:pages
```
