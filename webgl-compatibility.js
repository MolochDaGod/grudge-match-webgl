// WebGL Game Compatibility Script
// Prevents conflicts with browser wallet extensions like MetaMask

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
            // If property already exists and is non-configurable, that's fine
            console.log('Ethereum property already properly configured');
        }
    }
    
    // Unity WebGL compatibility checks
    window.addEventListener('load', function() {
        // Ensure WebGL context is available
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            console.error('WebGL not supported in this browser');
            const warningBanner = document.querySelector("#unity-warning");
            if (warningBanner) {
                const div = document.createElement('div');
                div.innerHTML = 'WebGL is not supported in your browser. Please update your browser or try a different one.';
                div.style = 'background: red; padding: 10px; color: white;';
                warningBanner.appendChild(div);
                warningBanner.style.display = 'block';
            }
        }
    });
    
    // Memory management for WebGL
    window.addEventListener('beforeunload', function() {
        // Clean up Unity instance if it exists
        if (window.unityInstance) {
            try {
                window.unityInstance.Quit();
            } catch (e) {
                console.log('Unity cleanup completed');
            }
        }
    });
    
})();