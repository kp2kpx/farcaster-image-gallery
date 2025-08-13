# Image Gallery Farcaster Mini App

This repository contains a basic **Farcaster Mini App** that displays all of the
images a user has previously shared in their casts. When opened inside
Farcaster, the app retrieves the viewer’s Farcaster ID (`fid`) via the Mini App
SDK, fetches their historical casts through the Neynar Hub API, extracts
image URLs, and renders them in a simple gallery.

## Features

- 🆕 **Automatic user identification:** the app determines the user’s `fid`
  through the Farcaster Mini App SDK so there is no need for manual sign‑in.
- 🔍 **Gallery of your cast images:** it fetches all of your past casts,
  extracts any images you shared (via embeds or direct links in the text), and
  displays them in a responsive grid.
- 🔁 **Deduplication:** duplicates are removed so each image appears only once.
- 🔧 **Configurable API:** swap out the Neynar API with another data source if
  desired; only a single header needs changing.

## Getting Started

### 1. Get a Neynar API key

While Farcaster is open‑source, there is no public HTTP endpoint for fetching
user casts without running your own hub. [Neynar](https://neynar.com/) hosts a
hub with an easy REST API and generous free tier. Sign up and locate your
**API key**, then replace the placeholder `'REPLACE_WITH_YOUR_NEYNAR_API_KEY'`
in `app.js` with your actual key:

```
const NEYNAR_API_KEY = 'your-api-key-here';
```

If you prefer to host your own hub or use a different service, modify the
`fetchCasts` function in `app.js` accordingly.

### 2. Host the files on a domain

Farcaster Mini Apps must be served over HTTPS from a domain you control. To
deploy locally for testing you can run a static server (e.g. with `python -m
http.server`) and view `index.html` directly in your browser, but Farcaster
clients will only load apps from https domains.

Place all files in your web root. The repository contains:

- `index.html` – the main entry point with embed meta tags and gallery markup.
- `app.js` – JavaScript logic that fetches casts and renders images.
- `style.css` – simple styles for the page and gallery.
- `.well-known/farcaster.json` – a manifest that identifies your app to
  Farcaster clients. Customize the fields inside this file to match your
  brand and hostnames. By default it includes placeholder values.

The `.well-known/farcaster.json` file **must** be served at the path
`/.well-known/farcaster.json` on your domain for Farcaster to recognise your
mini app.

### 3. Update your manifest

Edit `.well-known/farcaster.json` and replace the placeholder fields. At a
minimum you should provide:

- `name` – a short name for your app.
- `iconUrl` – a link to a square icon image (PNG recommended).
- `homeUrl` – the URL that should open when the user taps on your app.
- `imageUrl` and `buttonTitle` – used when your app is shared in casts.
- `splashImageUrl` and `splashBackgroundColor` – displayed while the app
  loads.

See the [Farcaster mini app publishing guide](https://miniapps.farcaster.xyz/docs/guides/publishing)
for more details on the manifest fields.

### 4. Share your app

Once hosted, you can share pages from your app by including an
`<meta name="fc:miniapp">` tag in the `<head>` of your HTML (as done in
`index.html`). When you paste the page URL into a cast, Farcaster will show a
card with the specified image and a button that launches your mini app.

## How It Works

1. **SDK handshake:** On page load, the script waits for the Farcaster Mini App
   SDK to become ready, then reads `sdk.context.user.fid` to identify the user.
2. **Fetch casts:** It sends an authenticated request to the Neynar Hub API
   endpoint `/v1/castsByFid` to retrieve the user’s historical casts (up to
   1,000 at once). If you have many casts, pagination can be added.
3. **Parse images:** Each message is scanned for image URLs either in its
   `embeds` array or within the cast text. Only files ending with
   `.png`, `.jpg`, `.jpeg`, `.gif` or `.webp` are considered.
4. **Render gallery:** Deduplicated images are appended as `<img>` elements
   inside a flexbox container.

## Limitations and Improvements

This sample is intentionally simple. Depending on your needs you may wish to:

- Add pagination to handle more than 1,000 casts.
- Display other media types (e.g. videos) or provide context like the cast
  timestamp.
- Cache results locally to reduce API calls.
- Handle errors and loading states more gracefully.
- Replace the Neynar API with your own Farcaster hub backend.

Pull requests and feedback are welcome!
