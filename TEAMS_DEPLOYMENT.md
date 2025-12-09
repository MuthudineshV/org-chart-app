# Microsoft Teams Deployment Guide

This guide describes how to deploy your **Interactive Org Chart** to Microsoft Teams as a personal tab.

## Prerequisites
- A Microsoft 365 Tenant with Admin permissions (or the ability to upload custom apps).
- The `manifest.json` file (already created in `public/`).
- Icon files (`color.png`, `outline.png`) in `public/`.

## Steps to Deploy

### 1. Create the App Package (Zip)
Microsoft Teams requires a `.zip` file containing:
- `manifest.json`
- `color.png`
- `outline.png`

**Mac/Linux Command:**
```bash
cd public
zip -r ../org-chart-teams-app.zip manifest.json color.png outline.png
```

### 2. Upload to Teams Developer Portal
1. Go to [Microsoft Teams Developer Portal](https://dev.teams.microsoft.com/).
2. Click **Apps** -> **Import App**.
3. Select the `org-chart-teams-app.zip` file you just created.
4. The portal will validate your manifest. If successful, you will see your app listed.

### 3. Preview in Teams
1. In the Developer Portal, click on your app.
2. Click **Preview in Teams**.
3. This will launch Teams and ask you to Add the app.

### 4. Admin Deployment (Optional)
To make it available for the whole organization:
1. Go to [Teams Admin Center](https://admin.teams.microsoft.com/).
2. Navigate to **Teams apps** -> **Manage apps**.
3. Click **Upload new app** and upload the zip file.

## Troubleshooting
- **"Manifest parsing failed"**: Check if the `id` (GUID) in `manifest.json` is unique.
- **"Content not loading"**: Ensure `https://cspl-designer.github.io/org-chart-app/` is accessible and added to `validDomains` in the manifest.
