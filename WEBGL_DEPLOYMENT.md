# WebGL Deployment Guide

This repository is configured to automatically deploy your Unity WebGL build to GitHub Pages.

## How it works

1. **Automatic Deployment**: Every push to the `master` or `main` branch triggers an automatic deployment
2. **GitHub Actions**: The `.github/workflows/deploy.yml` file handles the deployment process
3. **GitHub Pages**: Your game will be available at: `https://MolochDaGod.github.io/grudge-match-webgl/`

## Manual Deployment

You can also trigger a manual deployment:
1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the "Deploy Unity WebGL to GitHub Pages" workflow
4. Click "Run workflow"

## Build Structure

- `index.html` - Main HTML file that loads your Unity game
- `Build/` - Contains all Unity WebGL build files
- `TemplateData/` - Unity template assets and styling
- `StreamingAssets/` - Additional game assets

## Updating Your Game

1. Export your Unity project as WebGL build
2. Replace the contents of the `Build/` directory with your new build
3. Update `index.html` if needed
4. Commit and push your changes
5. GitHub Actions will automatically deploy the updated version

## Troubleshooting

- If deployment fails, check the Actions tab for error messages
- Ensure all build files are properly committed to git
- Make sure the repository has Pages enabled in Settings > Pages