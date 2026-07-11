# BillPocket Netlify Deploy

## Best Setup For Automatic Updates

Connect Netlify to a GitHub repository. After that, every time the updated app is pushed to GitHub, Netlify redeploys automatically.

## Netlify Settings

- Base directory: leave blank
- Build command: leave blank
- Publish directory: `outputs/bill-calendar-pwa`

The `netlify.toml` file already sets these defaults.

## Update Flow

1. Update the app files in `outputs/bill-calendar-pwa`.
2. Bump the service worker cache name in `outputs/bill-calendar-pwa/sw.js`.
3. Commit and push the changes to GitHub.
4. Netlify automatically publishes the new version.

## Manual Update Option

If you do not want GitHub yet, open Netlify Deploys and drag this folder into the deploy box:

`outputs/bill-calendar-pwa`

Manual drag-and-drop works, but it will not auto-update after future changes.
