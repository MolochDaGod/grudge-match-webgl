# 🎮 GRUDGE MATCH - Enhanced WebGL Experience

A Unity WebGL game with advanced deployment, performance optimization, and enhanced user experience features.

## 🚀 Play Now

[**🎮 Play GRUDGE MATCH**](https://MolochDaGod.github.io/grudge-match-webgl/)

## ✨ Features

### 🎯 Game Features
- **Enhanced UI/UX**: Beautiful responsive design with animated loading
- **Smart Device Detection**: Optimized experience for desktop, tablet, and mobile
- **Performance Monitoring**: Real-time FPS and memory tracking (Ctrl+M)
- **Fullscreen Support**: Seamless fullscreen experience (F11)
- **Advanced Error Handling**: Automatic error recovery and user-friendly messages
- **Game Info Overlay**: Comprehensive controls and system information (?)

### 🛠️ Technical Improvements
- **WebGL Optimization**: Materials auto-fixed for WebGL deployment
- **Compatibility Checking**: Comprehensive browser and device compatibility validation
- **Memory Management**: Automatic cleanup and optimization
- **Responsive Design**: Perfect scaling across all devices and orientations
- **Progressive Loading**: Smart loading with detailed progress indicators
- **Error Recovery**: Automatic recovery from WebGL context loss and memory issues

**Version**: 1.7.3+ Enhanced  
**Developer**: GrudgeStudio  
**Status**: ✅ Production Ready with Advanced Features

## 🎮 Game Controls

| Control | Action |
|---------|--------|
| `F11` | Toggle Fullscreen |
| `Escape` | Exit Fullscreen |
| `Ctrl + R` | Restart Game |
| `Ctrl + M` | Performance Monitor |
| `?` | Game Info & Help |
| `Click` | Focus Game Canvas |

## 🚀 Quick Deployment

### Option 1: Automated (Recommended)
```bash
npm run build
npm run deploy
```

### Option 2: GitHub Actions (Auto-Deploy)
1. Push to master branch
2. GitHub Actions automatically builds and deploys
3. Game available at your GitHub Pages URL

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

## 🌐 Enhanced Browser Compatibility

### ✅ Fully Supported
- **Chrome 90+** (Recommended) - Best performance and features
- **Firefox 88+** - Excellent compatibility
- **Edge 90+** - Full WebGL 2.0 support
- **Safari 14+** - Good performance on macOS/iOS

### 📱 Mobile Support
- **Android Chrome** - Optimized performance with reduced quality
- **iOS Safari** - Compatible with performance warnings
- **Tablets** - Enhanced experience in landscape mode

### 🔍 Auto-Detection Features
- **WebGL Support**: Automatic detection with fallback messages
- **WebAssembly**: Validation with user-friendly error handling
- **Device Memory**: Smart optimization based on available RAM
- **Connection Speed**: Adaptive loading based on network conditions

### ⚠️ Known Limitations
- WebGL performance varies on mobile devices
- Some browser extensions (wallets, ad blockers) may cause conflicts
- Older browsers may require manual enabling of WebGL

## 💻 Local Development

### Prerequisites
```bash
npm install
```

### Development Server (Recommended)
```bash
npm run dev          # Vite development server with hot reload
npm run serve        # Static HTTP server
```

### Alternative Methods
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000 -c-1

# Using PHP
php -S localhost:8000
```

### Available Scripts
- `npm run dev` - Development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Static file server
- `npm run deploy` - Deploy to GitHub Pages

### Development Features
- **Hot Reload**: Automatic refresh during development
- **Error Overlay**: Real-time error reporting
- **Performance Monitor**: Built-in FPS and memory tracking
- **Debug Console**: Enhanced logging and diagnostics

Then open `http://localhost:8000` in your browser.