# GRUDGE MATCH

A Unity WebGL game deployed on GitHub Pages with automated deployment.

## 🎮 Play Now

[Play GRUDGE MATCH](https://MolochDaGod.github.io/grudge-match-webgl/)

## 📖 About

GRUDGE MATCH is a Unity game built for WebGL and deployed as a web application with your AutoFixSceneMaterials system for optimized WebGL performance.

**Version**: 1.7.3  
**Developer**: GrudgeStudio  
**WebGL Optimization**: ✅ Materials auto-fixed for WebGL deployment

## 🚀 Quick Deployment

### Option 1: Automated (Recommended)
Run the deployment script:
```bash
deploy.bat
```

### Option 2: Manual GitHub Setup
1. Create a new repository on GitHub
2. Enable GitHub Pages with "GitHub Actions" source
3. Push your files - automatic deployment will trigger

## 🛠️ Unity WebGL Optimization

This build includes the AutoFixSceneMaterials system that automatically:
- Fixes null/missing materials in WebGL builds
- Optimizes shaders for WebGL compatibility  
- Creates fallback materials with appropriate colors
- Reduces draw calls and improves performance

## 🎯 Technical Details

- Built with Unity WebGL
- Optimized for both desktop and mobile browsers
- Canvas size: 480x800 pixels (portrait mode)

## Browser Compatibility

This game works best in modern browsers with WebGL support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Local Development

To run locally, serve the files with any HTTP server. For example:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.