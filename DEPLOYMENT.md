# GRUDGE MATCH - WebGL Deployment Instructions

This guide will help you deploy your Unity WebGL build to GitHub Pages with automated deployment.

## 🚀 Quick Setup

### 1. Repository Setup
1. Create a new repository on GitHub named `grudge-match-webgl`
2. Clone it locally or push your existing files

### 2. GitHub Pages Configuration
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. The workflow will automatically deploy on push to main/master branch

### 3. Local Development
Run locally for testing:
```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js (install dependencies first)
npm install
npm run serve

# Option 3: Using PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## 📁 File Structure
```
grudge-match-webgl/
├── Build/                     # Unity WebGL build files
├── TemplateData/             # Unity template assets
├── StreamingAssets/          # Unity streaming assets (if any)
├── .github/workflows/        # GitHub Actions workflow
├── index.html               # Main HTML file
├── package.json             # Node.js package info
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules
```

## 🔧 Build Process

### From Unity Editor:
1. **File** → **Build Settings**
2. Select **WebGL** platform
3. Click **Switch Platform**
4. Configure **Player Settings**:
   - **Company Name**: GrudgeStudio
   - **Product Name**: GRUDGE MATCH
   - **WebGL Template**: Default (or custom)
   - **Resolution**: 480x800 (portrait)
5. Click **Build** and choose your deployment folder

### Important WebGL Settings:
- **Compression Format**: Gzip (recommended for GitHub Pages)
- **Exception Support**: None (for smaller builds)
- **Code Optimization**: Master (for production)

## 🌐 Deployment

### Automatic Deployment (Recommended)
1. Push changes to your main/master branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. Your game will be available at: `https://yourusername.github.io/grudge-match-webgl/`

### Manual Deployment
```bash
# Using gh-pages package
npm install -g gh-pages
gh-pages -d .
```

## 🎮 Game Info
- **Version**: 1.7.3
- **Developer**: GrudgeStudio
- **Canvas Size**: 480x800 pixels (portrait mode)
- **WebGL Compatibility**: Modern browsers with WebGL support

## 🔍 Troubleshooting

### Common Issues:
1. **Files not loading**: Check that all Build/ files are committed
2. **404 errors**: Ensure GitHub Pages is enabled and pointing to root
3. **CORS errors**: Always serve via HTTP server, not file:// protocol
4. **Mobile performance**: Consider reducing canvas resolution for mobile

### Performance Tips:
- Use compressed textures
- Optimize audio files
- Minimize build size with asset optimization
- Test on target devices/browsers

## 📱 Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox  
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License
MIT License - see LICENSE file for details

---

**Live Demo**: https://MolochDaGod.github.io/grudge-match-webgl/