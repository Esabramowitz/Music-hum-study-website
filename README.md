# Music Humanities Study

A private, local-first study studio for Columbia Music Humanities. It uses Spotify only for account access, playlist metadata, and playback. Pieces, answer keys, written responses, and study history stay in this browser's IndexedDB database.

## Run locally

1. Install Node.js 24 or newer.
2. Copy `.env.example` to `.env`.
3. Add your Spotify Client ID to `VITE_SPOTIFY_CLIENT_ID`.
4. Run `npm install`, then `npm run dev`.
5. Open `http://127.0.0.1:5173/` in your browser.

## Spotify developer setup

Create an app at [Spotify for Developers](https://developer.spotify.com/dashboard), select **Web API** and **Web Playback SDK**, then add `http://127.0.0.1:5173/` as a Redirect URI. Copy its Client ID into `.env`. No client secret is used or needed: this app uses Authorization Code with PKCE. A Premium account is needed for playback.

Spotify's current Development Mode limits playlist-item access to playlists you own or collaborate on. For an instructor or public course playlist, first make a copy into your own Spotify account (or ask the owner to add you as a collaborator), then paste the copied playlist URL into this app.

## Data and privacy

All study data is persisted in IndexedDB in your browser. Clearing site data clears it, so export a full backup periodically. The app does not send answer keys, scores, responses, history, analytics, or tracking data anywhere. Spotify receives only the requests required for authentication, playlist import, and playback.

The regular Study Set export produces two spreadsheet-friendly CSV files: `Pieces` contains reusable answer keys, and `Playlists` contains membership. Import them individually; existing answer keys are updated while attempts and progress remain untouched. Full Backup uses JSON and includes all local state.

## Design notes

- Tracks are unique by Spotify Track ID, even if included by multiple playlists.
- Removing a playlist only removes its membership source; it never deletes pieces or attempt history.
- Pieces without answer keys remain eligible.
- Mastery is a transparent recency-weighted average of 1–5 scores: 0%, 25%, 50%, 75%, 100%.
- Below 80%, weaker pieces are more likely. At or above 80%, every piece has the same weight and remains eligible.

## Tests and build

Run `npm test` for the deterministic study-engine tests and `npm run build` for a production build.

## GitHub Pages

The hosted site is https://esabramowitz.github.io/Music-hum-study-website/.

The Pages workflow runs tests, builds the site, and deploys the generated dist folder after each push to main. GitHub Pages should use GitHub Actions as its publishing source. The production asset base is /Music-hum-study-website/; local development stays at /.

Production configuration is in .env.production. It contains only the public Spotify client ID and hosted redirect URI; Spotify PKCE does not use a client secret. Never commit .env, client secrets, tokens, exports, or browser data.

In your Spotify developer app, add this exact Redirect URI:

https://esabramowitz.github.io/Music-hum-study-website/

Keep http://127.0.0.1:5173/ registered too if you use local development. Spotify requires registered redirect URIs to match exactly, including the trailing slash.

Study progress is stored per browser and origin. To move local study data to the hosted site, export a full backup locally and restore it on the hosted site. Connecting Spotify does not transfer study data.
