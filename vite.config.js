import { defineConfig } from 'vite'

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
    chunkSizeWarningLimit: 50000,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      // Preserve Unity WebGL build structure
      output: {
        // Don't hash Unity WebGL files
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // Keep Unity build files in their original structure
          if (assetInfo.name && (
            assetInfo.name.includes('.wasm') ||
            assetInfo.name.includes('.data') ||
            assetInfo.name.includes('.framework.js') ||
            assetInfo.name.includes('.loader.js')
          )) {
            return 'Build/[name][extname]'
          }
          return 'assets/[name][extname]'
        }
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
    // Custom plugin to handle Unity WebGL files
    {
      name: 'unity-webgl-assets',
      generateBundle(options, bundle) {
        // Ensure Unity build files are copied correctly
        const buildFiles = ['Build/**/*', 'TemplateData/**/*', 'StreamingAssets/**/*']
        // Additional handling can be added here if needed
      }
    }
  ],
  
  // Public directory configuration
  publicDir: 'public'
})