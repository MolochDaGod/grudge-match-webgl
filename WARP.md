# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

GRUDGE MATCH is a Unity WebGL game optimized for web deployment with automated GitHub Pages integration. The project features a specialized WebGL build pipeline with material optimization and browser compatibility handling.

**Key Technologies:**
- Unity WebGL build system
- Vite for modern web bundling
- GitHub Actions for automated deployment
- Custom WebGL compatibility layer
- AutoFixSceneMaterials system for WebGL optimization

## Development Commands

### Local Development
```bash
# Start development server (Vite)
npm run dev

# Alternative local server for testing Unity build
npm run serve

# Quick Python server (if Node.js not available)
python -m http.server 8000
```

### Build and Deployment
```bash
# Build for production (creates dist/ directory)
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages (manual)
npm run deploy

# Run Windows deployment script
deploy.bat
```

### Package Management
```bash
# Install dependencies
npm install

# Clean install
npm ci
```

## Architecture Overview

### Unity WebGL Integration
- **Build Pipeline**: Custom `WebGLBuildProcessor.cs` handles pre-build material optimization
- **Material System**: `AutoFixSceneMaterials` automatically fixes WebGL-incompatible materials
- **Compatibility Layer**: `webgl-compatibility.js` prevents browser wallet extension conflicts

### Web Technology Stack
- **Bundler**: Vite with custom Unity WebGL configuration
- **Deployment**: GitHub Actions workflow with automated Pages deployment
- **Compatibility**: Browser wallet conflict resolution and WebGL fallback handling

### File Structure
```
Build/                          # Unity WebGL build output
├── GRUDGE_MATCH.data          # Game data (80MB)
├── GRUDGE_MATCH.wasm          # WebAssembly binary (40MB)
├── GRUDGE_MATCH.framework.js  # Unity framework
└── GRUDGE_MATCH.loader.js     # Unity loader

Assets/Editor/                  # Unity editor scripts
└── WebGLBuildProcessor.cs     # Build optimization system

.github/workflows/              # GitHub Actions
└── deploy.yml                 # Automated deployment

TemplateData/                   # Unity template assets
StreamingAssets/                # Unity streaming assets
```

### Build Configuration

**Vite Config Highlights:**
- Preserves Unity WebGL file structure without hashing
- Handles large Unity assets (50MB+ chunks)
- Configures proper CORS headers for WebGL
- Custom plugin for Unity asset management

**Unity WebGL Settings:**
- Gzip compression enabled
- Memory size: 256MB
- Exception support disabled for smaller builds
- Debug symbols disabled in production

### Browser Compatibility Features

**Wallet Extension Conflict Prevention:**
- Ethereum object protection to prevent MetaMask conflicts
- Property redefinition prevention
- WebGL context availability checks

**Mobile Optimization:**
- Responsive canvas sizing (480x800 desktop, adaptive mobile)
- Device pixel ratio optimization
- Performance warnings for mobile browsers

## Deployment Workflow

1. **Automatic Deployment**: Pushes to main/master trigger GitHub Actions
2. **Vite Build**: Creates optimized production bundle in `dist/`
3. **Unity Asset Copy**: Preserves Unity WebGL file structure
4. **GitHub Pages**: Deploys to `https://MolochDaGod.github.io/grudge-match-webgl/`

## Common Development Tasks

### Testing Local Changes
```bash
# After making changes to web files
npm run build
npm run preview

# For Unity build changes, copy new Build/ files then:
npm run serve
```

### Debugging WebGL Issues
```bash
# Check Unity build file integrity
ls -la Build/
# Expected files: .data (80MB), .wasm (40MB), .framework.js, .loader.js

# Test with cache busting
# Files automatically include ?v=timestamp in index.html
```

### Updating Unity Build
1. Export WebGL build from Unity
2. Replace `Build/` directory contents
3. Update version in `package.json` if needed
4. Commit and push (triggers automatic deployment)

## Performance Considerations

- **File Sizes**: Total download ~200MB+ for initial load
- **Browser Requirements**: Modern browsers with WebGL support
- **Memory**: 256MB WebGL memory allocation
- **Mobile**: Limited support, desktop browsers recommended

## Known Issues and Solutions

- **Browser Wallet Conflicts**: Resolved via `webgl-compatibility.js`
- **Mobile Performance**: Canvas resolution automatically reduced
- **CORS Issues**: Development server includes proper headers
- **File Loading**: Cache busting implemented for reliable updates