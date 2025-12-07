# 🔧 GRUDGE MATCH - Enhanced Troubleshooting Guide

## 🆕 New Features & Error Handling

The enhanced version includes:
- **🛡️ Advanced Error Recovery**: Automatic detection and recovery from common issues
- **📊 Performance Monitoring**: Real-time diagnostics (Press Ctrl+M)
- **🔍 Smart Compatibility Checks**: Automatic browser and device validation
- **❓ Interactive Help System**: Press `?` for in-game help and controls

## 🚑 Automatic Error Recovery

The game now automatically handles:
- WebGL context loss with auto-recovery
- Memory issues with cleanup and optimization
- Network errors with retry mechanisms
- Browser extension conflicts with isolation

## 🔧 Common Issues and Solutions

### 1. 👾 Enhanced Wallet Extension Protection
**Error**: `Cannot redefine property: ethereum`
**✅ Auto-Fixed**: The game now automatically prevents wallet extension conflicts.

**Manual Steps** (if issues persist):
- Press `?` to open game info and check compatibility
- Use incognito/private browsing mode
- Disable wallet extensions temporarily
- Check browser console for detailed error reports

### 2. File Loading Errors (404)
**Error**: `Failed to load resource: the server responded with a status of 404`
**Solution**: Verify build files are correctly referenced.

**Check List**:
- ✅ `Build/GRUDGE_MATCH.loader.js` exists
- ✅ `Build/GRUDGE_MATCH.data` exists  
- ✅ `Build/GRUDGE_MATCH.framework.js` exists
- ✅ `Build/GRUDGE_MATCH.wasm` exists
- ✅ `Build/GRUDGE_MATCH.jpg` exists

### 3. 📊 Enhanced Performance Monitoring
**New Features**:
- **Real-time Monitor**: Press `Ctrl+M` to toggle performance overlay
- **Smart Device Detection**: Automatic optimization for your device
- **Memory Management**: Automatic cleanup and garbage collection
- **Loading Analytics**: Detailed progress tracking with time estimates

**Performance Solutions**:
- Press `?` to check system information and recommendations
- Use Performance Monitor (Ctrl+M) to identify bottlenecks
- Game automatically reduces quality on low-memory devices
- Enhanced loading with compression detection
- Mobile devices get optimized settings automatically

### 4. 📱 Enhanced Mobile Experience
**New Mobile Features**:
- **Smart Orientation**: Automatic landscape detection and optimization
- **Responsive UI**: Perfect scaling across all screen sizes
- **Touch Optimized**: Improved touch controls and gesture handling
- **Performance Scaling**: Automatic quality reduction for mobile devices

**Mobile Recommendations**:
- Game automatically optimizes for your device
- Landscape orientation recommended for tablets
- Performance warnings shown for low-memory devices
- Fullscreen mode available in landscape (tablets)
- Press `?` for mobile-specific tips and controls

### 5. GitHub Pages Deployment Issues
**Common Problems**:
- Changes not reflecting: Check GitHub Actions deployment status
- 404 on GitHub Pages: Ensure repository settings have Pages enabled
- Files not updating: Clear browser cache (Ctrl+F5)

### 6. 🔧 Advanced Debugging Features

**New Developer Tools**:
- **Error Export**: `window.ErrorReporting.export()` - Download detailed error log
- **Compatibility Check**: `window.GameCompatibility.recheck()` - Re-run compatibility tests
- **Performance Stats**: Available in browser console during gameplay
- **Memory Cleanup**: `window.ErrorReporting.clear()` - Clear error history

**Debug Commands** (Browser Console):
```javascript
// Check game compatibility
window.GameCompatibility.results

// View error history
window.ErrorReporting.getErrors()

// Export error report
window.ErrorReporting.export()

// Access game controls
window.GameControls.fullscreen()
window.GameControls.performance()
```

### 7. 🧪 Local Testing & Development
For developers testing locally:
```bash
# Modern development setup
npm install
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run preview    # Preview production build

# Legacy method
cd /path/to/grudge-match-webgl

# Start local server (choose one):
python -m http.server 8000
# OR
npx http-server -p 8000
# OR  
php -S localhost:8000

# Open in browser:
# http://localhost:8000
```

## 🔍 Debug Information

### Check Console for Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the page
4. Look for any red error messages

### Network Tab Debugging
1. Open DevTools → Network tab
2. Refresh the page
3. Check if any files show red (failed to load)
4. Verify file sizes match expected values

### Expected File Sizes
- `GRUDGE_MATCH.data`: ~80MB
- `GRUDGE_MATCH.wasm`: ~40MB  
- `GRUDGE_MATCH.framework.js`: ~80KB
- `GRUDGE_MATCH.loader.js`: ~13KB
- `GRUDGE_MATCH.jpg`: ~138KB

## 🛠️ Advanced Fixes

### Clear Unity Web Cache
1. Open browser console
2. Run: `localStorage.clear()`
3. Run: `sessionStorage.clear()`
4. Refresh page

### Reset Browser WebGL State
1. Go to `chrome://settings/content/all`
2. Search for your game site
3. Clear all site data
4. Restart browser

### Force Rebuild (For Developers)
If you need to rebuild from Unity:
1. In Unity: File → Build Settings
2. Select WebGL platform  
3. Player Settings → Publishing Settings
4. Set Compression Format to "Disabled" for easier debugging
5. Build and replace files

## 📞 Support

If issues persist:
1. Check the [GitHub repository](https://github.com/MolochDaGod/grudge-match-webgl) for updates
2. Report issues with browser console errors
3. Include your browser version and operating system

---

**Last Updated**: September 30, 2025  
**Game Version**: 1.7.3