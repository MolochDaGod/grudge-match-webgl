import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  // Configure for GitHub Pages deployment
  base: '/grudge-match-webgl/',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Don't minify Unity WebGL files as they may break
    minify: false,
    // Ensure large Unity files are handled properly
    chunkSizeWarningLimit: 100000,
    // Copy Unity files directly without processing
    copyPublicDir: false,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      // External Unity files to avoid processing
      external: (id) => {
        return id.includes('.wasm') || id.includes('.data') || id.includes('.unityweb')
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 8000,
    host: true,
    // Serve Unity WebGL files with correct headers
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  
  // Handle Unity WebGL file types
  assetsInclude: [
    '**/*.wasm',
    '**/*.data',
    '**/*.unityweb',
    '**/*.br',
    '**/*.gz'
  ],
  
  // Plugin configuration
  plugins: [
    // Custom plugin to copy Unity WebGL files
    {
      name: 'copy-unity-assets',
      writeBundle() {
        const fs = require('fs')
        const path = require('path')
        
        // Copy Unity build files
        const copyDir = (src, dest) => {
          if (!fs.existsSync(src)) return
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
          
          const files = fs.readdirSync(src)
          files.forEach(file => {
            const srcPath = path.join(src, file)
            const destPath = path.join(dest, file)
            
            if (fs.statSync(srcPath).isDirectory()) {
              copyDir(srcPath, destPath)
            } else {
              fs.copyFileSync(srcPath, destPath)
            }
          })
        }
        
        // Copy essential directories
        copyDir('Build', 'dist/Build')
        copyDir('TemplateData', 'dist/TemplateData')
        copyDir('StreamingAssets', 'dist/StreamingAssets')
        
        // Copy root files
        const rootFiles = ['webgl-compatibility.js']
        rootFiles.forEach(file => {
          if (fs.existsSync(file)) {
            fs.copyFileSync(file, `dist/${file}`)
          }
        })
        
        console.log('Unity WebGL assets copied to dist/')
      }
    }
  ],
  
  // Public directory configuration  
  publicDir: false
})