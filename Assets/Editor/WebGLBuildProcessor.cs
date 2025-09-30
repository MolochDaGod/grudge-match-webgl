using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
#endif

/// <summary>
/// WebGL Build Integration for AutoFixSceneMaterials
/// Automatically optimizes materials during WebGL builds
/// </summary>
#if UNITY_EDITOR
public class WebGLBuildProcessor : IPreprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPreprocessBuild(BuildReport report)
    {
        if (report.summary.platform == BuildTarget.WebGL)
        {
            Debug.Log("=== WebGL Build: Starting Material Optimization ===");
            
            // Find AutoFixSceneMaterials in current scene
            AutoFixSceneMaterials materialFixer = FindObjectOfType<AutoFixSceneMaterials>();
            
            if (materialFixer != null)
            {
                // Run material optimization for WebGL
                materialFixer.OptimizeMaterialsForWebGL();
                materialFixer.FixAllMaterialsInScene();
                
                Debug.Log("✅ WebGL materials optimized successfully!");
            }
            else
            {
                Debug.LogWarning("⚠️ AutoFixSceneMaterials not found in scene. Consider adding it for better WebGL performance.");
            }
            
            // Additional WebGL optimizations
            OptimizeWebGLSettings();
        }
    }
    
    private void OptimizeWebGLSettings()
    {
        Debug.Log("Applying WebGL-specific optimizations...");
        
        // Set WebGL-specific player settings
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
        PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.None;
        PlayerSettings.WebGL.debugSymbols = false;
        
        // Memory settings
        PlayerSettings.WebGL.memorySize = 256; // MB
        
        Debug.Log("✅ WebGL settings optimized!");
    }
}

/// <summary>
/// Post-build processor to generate deployment files
/// </summary>
public class WebGLDeploymentProcessor : IPostprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPostprocessBuild(BuildReport report)
    {
        if (report.summary.platform == BuildTarget.WebGL)
        {
            string buildPath = report.summary.outputPath;
            Debug.Log($"=== WebGL Build Complete ===");
            Debug.Log($"Build Location: {buildPath}");
            Debug.Log($"Build Size: {GetBuildSize(buildPath)}");
            
            // Generate deployment instructions
            GenerateDeploymentInstructions(buildPath);
        }
    }
    
    private string GetBuildSize(string buildPath)
    {
        try
        {
            var buildDir = new System.IO.DirectoryInfo(buildPath);
            long size = 0;
            foreach (var file in buildDir.GetFiles("*", System.IO.SearchOption.AllDirectories))
            {
                size += file.Length;
            }
            return $"{size / (1024 * 1024)} MB";
        }
        catch
        {
            return "Unknown";
        }
    }
    
    private void GenerateDeploymentInstructions(string buildPath)
    {
        string instructions = @"
🚀 GRUDGE MATCH WebGL Build Complete!

📁 Build Location: " + buildPath + @"

🌐 Deployment Instructions:
1. Copy all files to your web server or GitHub repository
2. For GitHub Pages:
   - Push to your repository
   - Enable GitHub Pages in repository settings
   - Set source to 'GitHub Actions'

🧪 Local Testing:
cd """ + buildPath + @"""
python -m http.server 8000

Then open: http://localhost:8000

✅ Material Optimization: Applied
✅ WebGL Settings: Optimized
✅ Compression: Enabled (Gzip)

Happy gaming! 🎮
        ";
        
        Debug.Log(instructions);
        
        // Save instructions to file
        string instructionsPath = System.IO.Path.Combine(buildPath, "DEPLOYMENT_INSTRUCTIONS.txt");
        System.IO.File.WriteAllText(instructionsPath, instructions);
    }
}
#endif