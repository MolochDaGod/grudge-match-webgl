# GRUDGE MATCH - Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. Ethereum/Wallet Extension Conflicts
**Error**: `Cannot redefine property: ethereum`
**Solution**: The updated index.html now includes protection against wallet extension conflicts.

**Additional Steps**:
- Disable browser wallet extensions (MetaMask, etc.) while playing
- Use incognito/private browsing mode
- Clear browser cache and cookies

### 2. File Loading Errors (404)
**Error**: `Failed to load resource: the server responded with a status of 404`
**Solution**: Verify build files are correctly referenced.

**Check List**:
- ✅ `Build/GRUDGE_MATCH.loader.js` exists
- ✅ `Build/GRUDGE_MATCH.data` exists  
- ✅ `Build/GRUDGE_MATCH.framework.js` exists
- ✅ `Build/GRUDGE_MATCH.wasm` exists
- ✅ `Build/GRUDGE_MATCH.jpg` exists

### 3. Loading Performance Issues
**Solutions**:
- Use Chrome or Firefox for best performance
- Close other tabs to free up memory
- Ensure good internet connection for initial load
- Wait for full download (80MB+ total)

### 4. Mobile Compatibility
**Note**: WebGL games have limited mobile support
**Recommendations**:
- Use desktop browser for best experience
- On mobile: use landscape orientation
- Reduce browser zoom if UI appears cut off

### 5. GitHub Pages Deployment Issues
**Common Problems**:
- Changes not reflecting: Check GitHub Actions deployment status
- 404 on GitHub Pages: Ensure repository settings have Pages enabled
- Files not updating: Clear browser cache (Ctrl+F5)

### 6. Local Testing
If you need to test locally:
```bash
# Navigate to your build directory
cd "c:\Users\nugye\Desktop\connectwebgl (1)\grudge-match-webgl"

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