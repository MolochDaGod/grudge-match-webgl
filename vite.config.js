import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  // Use root base path for Vercel deployment
  base: '/',
  
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
        // Copy Unity build files (using ESM fs imports from top of file)
        const copyDir = (src, dest) => {
          if (!existsSync(src)) return
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
          
          const files = readdirSync(src)
          files.forEach(file => {
            const srcPath = join(src, file)
            const destPath = join(dest, file)
            
            if (statSync(srcPath).isDirectory()) {
              copyDir(srcPath, destPath)
            } else {
              copyFileSync(srcPath, destPath)
            }
          })
        }
        
        // Copy essential directories
        copyDir('Build', 'dist/Build')
        copyDir('TemplateData', 'dist/TemplateData')
        copyDir('StreamingAssets', 'dist/StreamingAssets')
        
        // Copy root files
        const rootFiles = ['webgl-compatibility.js', 'error-handler.js']
        rootFiles.forEach(file => {
          if (existsSync(file)) {
            copyFileSync(file, `dist/${file}`)
          }
        })
        
        console.log('Unity WebGL assets copied to dist/')
      }
    }
  ],
  
  // Public directory configuration  
  publicDir: false
})
