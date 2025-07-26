# Script to remove duplicate regulatory-management section
$htmlFile = "c:\Users\Mabutfo Dlamini\Desktop\royalties-database\royalties.html"
$content = Get-Content $htmlFile -Raw

Write-Host "Looking for duplicate regulatory-management section..."

# Find sections that come after the first regulatory-management
$pattern = '(?s)<!-- (?:New )?Regulatory Management[^>]*-->\s*<section id="regulatory-management">.*?</section>\s*'

$matches = [regex]::Matches($content, $pattern)
Write-Host "Found $($matches.Count) regulatory-management section patterns"

if ($matches.Count -ge 2) {
    # Remove the last match (the duplicate)  
    $lastMatch = $matches[$matches.Count - 1]
    $beforeMatch = $content.Substring(0, $lastMatch.Index)
    $afterMatch = $content.Substring($lastMatch.Index + $lastMatch.Length)
    $content = $beforeMatch + $afterMatch
    
    Write-Host "Removed duplicate regulatory-management section"
    
    # Write back to file
    Set-Content $htmlFile $content -Encoding UTF8
    Write-Host "File updated"
    
    # Verify
    $finalContent = Get-Content $htmlFile
    $regCount = ($finalContent | Select-String -SimpleMatch "regulatory-management").Count
    Write-Host "Final regulatory-management count: $regCount"
    Write-Host "Final file has $($finalContent.Count) lines"
} else {
    Write-Host "Could not find duplicate pattern to remove"
}
