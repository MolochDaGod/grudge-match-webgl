// Enhanced WebGL Game Compatibility Script
// Comprehensive browser compatibility and performance optimization

(function() {
    'use strict';
    
    // Store original ethereum object if it exists
    const originalEthereum = window.ethereum;
    
    // Prevent wallet extensions from interfering with Unity WebGL
    if (typeof window.ethereum !== 'undefined') {
        console.log('Browser wallet detected. Ensuring game compatibility...');
        
        // Create a non-enumerable property to prevent redefinition errors
        try {
            Object.defineProperty(window, 'ethereum', {
                value: originalEthereum,
                writable: false,
                configurable: false
            });
        } catch (e) {
            console.log('Ethereum property already configured');
        }
    }
    
    // Enhanced WebGL compatibility checking
    function checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return { supported: false, version: 'none' };
            
            const info = {
                supported: true,
                version: gl.getParameter(gl.VERSION),
                renderer: gl.getParameter(gl.RENDERER),
                vendor: gl.getParameter(gl.VENDOR),
                webgl2: !!canvas.getContext('webgl2'),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
            };
            
            return info;
        } catch (e) {
            return { supported: false, error: e.message };
        }
    }
    
    // WebAssembly support check
    function checkWasmSupport() {
        try {
            if (typeof WebAssembly !== 'object') return { supported: false, reason: 'WebAssembly not available' };
            if (typeof WebAssembly.instantiate !== 'function') return { supported: false, reason: 'WebAssembly.instantiate missing' };
            
            // Quick WASM validation test
            const wasmCode = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
            return WebAssembly.validate(wasmCode) ? { supported: true } : { supported: false, reason: 'WASM validation failed' };
        } catch (e) {
            return { supported: false, error: e.message };
        }
    }
    
    // Performance and device capability check
    function checkDeviceCapabilities() {
        const capabilities = {
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown',
            platform: navigator.platform,
            mobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
            chrome: /Chrome/i.test(navigator.userAgent),
            firefox: /Firefox/i.test(navigator.userAgent),
            safari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)
        };
        
        // Performance warnings
        const warnings = [];
        if (capabilities.memory && capabilities.memory < 2) {
            warnings.push('Low device memory (< 2GB)');
        }
        if (capabilities.mobile) {
            warnings.push('Mobile device - performance may be limited');
        }
        if (capabilities.safari && capabilities.mobile) {\n            warnings.push('Mobile Safari - may have WebGL limitations');\n        }\n        \n        return { capabilities, warnings };\n    }\n    \n    // Comprehensive compatibility check\n    function runCompatibilityCheck() {\n        const webgl = checkWebGLSupport();\n        const wasm = checkWasmSupport();\n        const device = checkDeviceCapabilities();\n        \n        const results = { webgl, wasm, device, timestamp: new Date().toISOString() };\n        console.log('🎮 Game Compatibility Check:', results);\n        \n        const errors = [];\n        if (!webgl.supported) errors.push(`WebGL: ${webgl.error || webgl.version}`);\n        if (!wasm.supported) errors.push(`WebAssembly: ${wasm.error || wasm.reason}`);\n        \n        return { results, errors, warnings: device.warnings };\n    }\n    \n    // Show compatibility results\n    function displayCompatibilityResults(check) {\n        if (check.errors.length > 0) {\n            console.error('❌ Compatibility Errors:', check.errors);\n            showBanner('Game cannot run: ' + check.errors.join(', '), 'error');\n            return false;\n        }\n        \n        if (check.warnings.length > 0) {\n            console.warn('⚠️ Performance Warnings:', check.warnings);\n            if (check.warnings.some(w => w.includes('memory'))) {\n                showBanner('Low memory detected - game may run slowly', 'warning');\n            }\n        }\n        \n        console.log('✅ Browser compatibility check passed!');\n        return true;\n    }\n    \n    // Banner utility\n    function showBanner(message, type = 'warning') {\n        const warningBanner = document.querySelector(\"#unity-warning\");\n        if (warningBanner) {\n            const div = document.createElement('div');\n            div.innerHTML = message;\n            div.style = type === 'error' ? \n                'background: #ff4444; padding: 10px; color: white; margin: 5px 0;' :\n                'background: #ff9900; padding: 10px; color: white; margin: 5px 0;';\n            warningBanner.appendChild(div);\n            warningBanner.style.display = 'block';\n            \n            if (type !== 'error') {\n                setTimeout(() => {\n                    if (div.parentNode) div.parentNode.removeChild(div);\n                }, 8000);\n            }\n        }\n    }\n    \n    // Run compatibility check when DOM is ready\n    function initCompatibilityCheck() {\n        const check = runCompatibilityCheck();\n        const compatible = displayCompatibilityResults(check);\n        \n        // Store results globally for debugging\n        window.GameCompatibility = {\n            results: check.results,\n            compatible: compatible,\n            recheck: runCompatibilityCheck\n        };\n        \n        return compatible;\n    }\n    \n    // Memory management and cleanup\n    window.addEventListener('beforeunload', function() {\n        if (window.unityInstance) {\n            try {\n                console.log('🧹 Cleaning up Unity instance...');\n                window.unityInstance.Quit();\n            } catch (e) {\n                console.log('Unity cleanup completed');\n            }\n        }\n    });\n    \n    // Initialize when DOM is ready\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', initCompatibilityCheck);\n    } else {\n        initCompatibilityCheck();\n    }\n    \n})();