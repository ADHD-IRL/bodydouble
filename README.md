**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

---

## Public resource library on GitHub Pages

The **Neurodivergence Library** (`/resources`) is fully static, so it is also
published on GitHub Pages as a standalone public site:

**https://adhd-irl.github.io/bodydouble/**

The rest of the app is not deployed there — it needs the Base44 backend for auth
and data, which does not exist on Pages. The Pages build renders the resource
library only, with the Base44 SDK tree-shaken out entirely.

### One-time setup

In the repository: **Settings → Pages → Build and deployment → Source →
GitHub Actions**. Without this, the deploy job fails.

### How it works

- `.github/workflows/deploy-pages.yml` builds and deploys on every push to
  `main` that touches the site, plus manual **Run workflow** dispatches.
- `npm run build:pages` sets `VITE_STANDALONE=true`, which:
  - boots `src/StandaloneApp.jsx` instead of `src/App.jsx` (no auth gate, no SDK),
  - serves from the repo sub-path via `PAGES_BASE` (default `/bodydouble/`),
  - outputs to `dist-pages/`.
- Routing uses `HashRouter`, because GitHub Pages has no SPA rewrite and a
  path-based deep link would 404.
- Download links are resolved through `assetUrl()` so they respect the sub-path.

### Preview the static site locally

```bash
npm run build:pages
npm run preview:pages
```

The normal `npm run dev` / `npm run build` Base44 workflow is unchanged.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
