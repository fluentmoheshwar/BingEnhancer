# PowerShell script to generate bangs.js from bang.ts
# Run this in the project root: ./js/generateBangs.ps1

param(
    [string]$bangTsPath = "C:\Users\Moheshwar\Downloads\bang.ts",
    [string]$outputPath = "./js/bangs.js"
)

function Generate-BangsFile {
    param(
        [string]$sourcePath,
        [string]$targetPath
    )
    
    Write-Host "Reading bang.ts from: $sourcePath" -ForegroundColor Cyan
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "Error: bang.ts not found at $sourcePath" -ForegroundColor Red
        exit 1
    }
    
    # Read the entire file
    $content = Get-Content $sourcePath -Raw
    
    # Extract bangs using regex: t: "tag", u: "url"
    $pattern = 't:\s*"([^"]+)",\s*u:\s*"([^"]*)"'
    $matches = [regex]::Matches($content, $pattern)
    
    Write-Host "Found $($matches.Count) bangs" -ForegroundColor Green
    
    # Start building the JavaScript file
    $jsContent = @"
/**
 * GENERATED FILE - Complete Bang definitions for BingEnhancer
 * Source: $sourcePath
 * Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
 * Total bangs: $($matches.Count)
 * 
 * This file was auto-generated from bang.ts
 * To regenerate, run: ./generateBangs.ps1
 */

const BANGS = {
"@
    
    # Group matches by tag to avoid duplicates (use the last/most specific one)
    $bangDict = @{}
    foreach ($match in $matches) {
        $tag = $match.Groups[1].Value
        $url = $match.Groups[2].Value
        # Escape backslashes in URL
        $url = $url -replace '\\', '\\'
        $bangDict[$tag] = $url
    }
    
    # Add all bangs to the output
    $count = 0
    foreach ($tag in ($bangDict.Keys | Sort-Object)) {
        $url = $bangDict[$tag]
        # Escape quotes in URL
        $url = $url -replace '"', '\"'
        
        $jsContent += "`n  `"$tag`": `"$url`","
        $count++
    }
    
    # Remove trailing comma from last entry
    $jsContent = $jsContent -replace ',$', ''
    
    $jsContent += @"

};

// Export for use in content script
if (typeof window !== 'undefined') {
  window.BANGS = BANGS;
}

// For Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BANGS;
}
"@
    
    # Write to output file
    Write-Host "Writing $count bangs to: $targetPath" -ForegroundColor Cyan
    Set-Content -Path $targetPath -Value $jsContent -Encoding UTF8
    
    Write-Host "✓ Successfully generated bangs.js with $count bang definitions" -ForegroundColor Green
}

# Run the generation
Generate-BangsFile -sourcePath $bangTsPath -targetPath $outputPath
