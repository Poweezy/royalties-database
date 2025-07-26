# Script to remove the remaining duplicate audit-dashboard section
$htmlFile = "c:\Users\Mabutfo Dlamini\Desktop\royalties-database\royalties.html"
$content = Get-Content $htmlFile -Raw

Write-Host "Looking for duplicate audit-dashboard section..."

# Find the pattern for the second audit-dashboard section 
# This should be after regulatory-management and before profile
$pattern = '(?s)<!-- Audit Dashboard -->\s*<section id="audit-dashboard">.*?</section>\s*(?=<!-- [^A])'

$matches = [regex]::Matches($content, $pattern)
Write-Host "Found $($matches.Count) audit-dashboard section patterns"

if ($matches.Count -ge 2) {
    # Remove the last match (the duplicate)
    $lastMatch = $matches[$matches.Count - 1]
    $beforeMatch = $content.Substring(0, $lastMatch.Index)
    $afterMatch = $content.Substring($lastMatch.Index + $lastMatch.Length)
    $content = $beforeMatch + $afterMatch
    
    Write-Host "Removed duplicate audit-dashboard section"
    
    # Write back to file
    Set-Content $htmlFile $content -Encoding UTF8
    Write-Host "File updated"
    
    # Verify
    $finalContent = Get-Content $htmlFile
    $auditCount = ($finalContent | Select-String -SimpleMatch "audit-dashboard").Count
    Write-Host "Final audit-dashboard count: $auditCount"
    Write-Host "Final file has $($finalContent.Count) lines"
} else {
    Write-Host "Could not find duplicate pattern to remove"
}
