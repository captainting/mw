# MW Ferry

A static HTML site for the Mui Wo ↔ Central ferry route. It uses browser geolocation to decide whether the user is closer to Mui Wo Pier or Central Pier, then shows the next ferry in that direction.

## Files

- `index.html` — page structure
- `styles.css` — mobile-first UI
- `script.js` — timetable, clock, geolocation and next-ferry logic
- `assets/mw-logo.svg` — site logo
- `assets/favicon.svg` — app icon/favicon
- `assets/mw-brand-board.png` — generated logo brand board

## GitHub Pages

1. Create a new GitHub repository, for example `mw-ferry`.
2. Upload all files in this folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**.
6. Save. Your website will be available in a few minutes.

Important: geolocation requires HTTPS. GitHub Pages uses HTTPS, so it should work after publishing.
