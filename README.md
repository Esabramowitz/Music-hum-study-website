# Music Humanities Study

A browser-based listening study tool for a small, approved Spotify study group.

**Open the site:** https://esabramowitz.github.io/Music-hum-study-website/

Visitors do not install software, run a local server, or upload a spreadsheet. Each visitor connects their own approved Spotify account. Each browser keeps its own playlists, notes, and progress.

## For study group members

1. Ask the organizer to approve the Spotify account you will use. Spotify Premium is required for playback.
2. Open the website and go to **Playlists → Connect Spotify**.
3. Paste the link to a playlist you own or collaborate on. For an instructor's playlist, copy its songs into a playlist you created, then use the new link. Following or saving a playlist does not make you its owner.
4. Check the playlists you want to study. Both the quiz pool and **Pieces** page use this selection, with overlapping tracks shown once.
5. On **Study**, play a random excerpt, write your response, and reveal the answer. Choose **Edit piece information** to update the title, composer, and answer notes, then save. No answer file is required.
6. Choose a score from 1–5 and advance. Skipping does not record an attempt. **Progress** includes your saved history across all imported pieces, including playlists that are no longer selected.

You can also edit information on the Pieces page. Changes are personal to this browser; they do not edit Spotify's metadata or other members' notes. Removing a playlist removes its membership only, preserving saved information and attempts. Re-adding it preserves your edits.

## Spotify access: organizer setup

This is a public website with a restricted Spotify integration. Hosting it on GitHub Pages does not remove Spotify's Development Mode restrictions. A shared Development Mode app normally supports up to five authorized users; the app owner must maintain Spotify Premium. Approve each member's Spotify account in the developer dashboard's **Users and Access** section. Do not promise access to arbitrary visitors.

In the [Spotify developer dashboard](https://developer.spotify.com/dashboard), configure the app for **Web API** and **Web Playback SDK**, and register these exact redirect URIs:

- Hosted: `https://esabramowitz.github.io/Music-hum-study-website/`
- Local development, if used: `http://127.0.0.1:5173/`

The trailing slash and capitalization matter. Members authorize the app through Spotify; never ask them to share passwords, access tokens, or a client secret.

The app uses Authorization Code with PKCE and checks the current Spotify profile before showing a connected state. Access and refresh tokens stay in the tab's session storage, with automatic token refresh during an active session. Disconnecting clears the session credentials while retaining local study data. A browser restart or closed session may require reconnecting.

Production configuration is in `.env.production`. The Spotify **client ID is a public application identifier**, not a client secret. It is intentionally included in the browser build. No client secret is used or stored. Local overrides belong in ignored `.env` / `.env.*.local` files.

Official references:

- [Development Mode and quota rules](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Playlist access restrictions](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)

## Data, backups, and different machines

Study data is stored in IndexedDB for this site's origin in each browser. There is no shared study database, analytics service, or automatic cross-device sync. Spotify receives authentication, metadata, and playback requests. The browser also loads Spotify's playback SDK, playlist artwork, and Google Fonts.

**Settings → Download backup** saves all local playlists, pieces, answer notes, scores, and written responses as JSON. **Restore backup** merges a previously downloaded backup; importing the same attempts again does not duplicate them. It is optional and is not part of adding study information. Spreadsheet imports and exports are not supported.

To move to another machine or browser, download a backup in the old browser and restore it in the new browser. This also applies when moving from localhost to GitHub Pages or to a custom domain. Clearing site data removes the local collection. Signing into the same Spotify account does not synchronize notes or scores. Browsers that block persistent storage cannot save study data.

## Troubleshooting

- **403 on a playlist:** confirm you own it or are a collaborator and that the connected account is the owning account. Copy an instructor's playlist into your own account. If that still fails, have the organizer check approved users and the app owner's Premium subscription.
- **Sign-in works but account access is rejected:** the Spotify account may not be approved. Ask the organizer to add the correct account in Users and Access.
- **Redirect error:** register the exact URL above in the same developer app identified by the deployed client ID.
- **Playback fails:** use a supported browser with protected-media playback enabled and an active Spotify Premium account. Reconnect Spotify if prompted.
- **Pieces is empty:** select at least one imported playlist. Unchecked playlists do not contribute pieces.
- **Information is missing on a different machine:** restore a JSON backup; data is browser-local.
- **A blank site after deployment:** check the Actions runs. The compiled website must be deployed after GitHub's default branch publishing job.

## Local development

Requires Node.js 24 or newer and npm.

```sh
npm ci
```

Copy `.env.example` to `.env`, fill in your public Spotify client ID, and register the local redirect URI. Then:

```sh
npm run dev
```

Open `http://127.0.0.1:5173/`. This is for development; group members use the hosted URL.

```sh
npm test
npm run build
npm run preview
```

The build checks TypeScript and outputs `dist/`. Preview serves the production build at `http://127.0.0.1:4173/Music-hum-study-website/`; Spotify sign-in uses the configured production redirect, so use the hosted site or dev server for real sign-in testing.

## Deployment and repository contents

The current repository uses branch-based GitHub Pages publishing. `.github/workflows/pages.yml` listens for completion of GitHub's `pages-build-deployment` workflow, runs tests, builds the app, and deploys **only `dist/`** afterward. This prevents the default branch deployment from overwriting the compiled app with the source HTML. A manual workflow dispatch is also available. If changing Pages to GitHub Actions as the sole publishing source, change the workflow trigger to pushes on `main` at the same time.

Production assets use `/Music-hum-study-website/`; the dev server uses `/`. A custom domain requires updating the production base and Spotify redirect URI, and registering the new redirect with Spotify before deployment.

Track source code, tests, the dependency manifest and lockfile, build/deployment configuration, public environment configuration, and this documentation. Do not track dependencies, build output, caches, local environment overrides, tokens, screenshots, personal backups, or spreadsheet exports. Tests remain tracked because deployment runs them. GitHub publishes the built app, not browser study data.

## Study selection and mastery

Tracks are unique by Spotify track ID. Scores 1–5 map to 0%, 25%, 50%, 75%, and 100%. Mastery is a recency-weighted average with weight multiplied by 0.8 per older attempt. Below 80%, weaker pieces receive higher selection weight; pieces at or above 80% have equal baseline weight and remain eligible. Consecutive repetition is avoided when more than one piece is available.
