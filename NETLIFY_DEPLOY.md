# BillPocket Netlify Deploy

Production: https://billpocket.netlify.app/
Dashboard: https://app.netlify.com/projects/billpocket/overview

## Best Setup For Automatic Updates

Connect Netlify to a GitHub repository. After that, every time the updated app is pushed to GitHub, Netlify redeploys automatically.

## Netlify Settings

- Base directory: leave blank
- Build command: leave blank
- Publish directory: `outputs/bill-calendar-pwa`

The `netlify.toml` file already sets these defaults.

## Update Flow

1. Update the app files in `outputs/bill-calendar-pwa`.
2. Set the same new `APP_VERSION` in `app.js` and `sw.js`; this also updates the offline cache name.
3. Commit and push the changes to GitHub.
4. Netlify automatically publishes the new version.

On the phone, open History (Log), check the displayed version, and use Check for updates. Use Refresh app when offered. Do not clear site data to update; bill and transaction records are stored on that device.

## Manual Update Option

If you do not want GitHub yet, open Netlify Deploys and drag this folder into the deploy box:

`outputs/bill-calendar-pwa`

Manual drag-and-drop works, but it will not auto-update after future changes.
