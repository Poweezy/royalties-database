# PowerShell script to remove duplicate sections from HTML file
$htmlFile = "c:\Users\Mabutfo Dlamini\Desktop\royalties-database\royalties.html"
$content = Get-Content $htmlFile -Raw

# Remove second audit-dashboard section (after line 1470)
$pattern1 = '(?s)(\s*<!-- Audit Dashboard -->\s*<section id="audit-dashboard">.*?</section>)(?=\s*<!-- Reporting & Analytics -->)'
$matches1 = [regex]::Matches($content, $pattern1)

if ($matches1.Count -gt 1) {
    Write-Host "Found $($matches1.Count) Audit Dashboard sections"
    # Remove the second occurrence
    $content = $content -replace $pattern1, '', 1
    Write-Host "Removed duplicate Audit Dashboard section"
} else {
    Write-Host "No duplicate Audit Dashboard sections found to remove"
}

# Remove second reporting-analytics section (after line 1519) 
$pattern2 = '(?s)(\s*<!-- Reporting & Analytics -->\s*<section id="reporting-analytics">.*?</section>)(?=\s*<!-- [^R])'
$matches2 = [regex]::Matches($content, $pattern2)

if ($matches2.Count -gt 1) {
    Write-Host "Found $($matches2.Count) Reporting & Analytics sections"
    # Remove the second occurrence
    $content = $content -replace $pattern2, '', 1
    Write-Host "Removed duplicate Reporting & Analytics section"
} else {
    Write-Host "No duplicate Reporting & Analytics sections found to remove"
}

# Write back to file
Set-Content $htmlFile $content -Encoding UTF8
Write-Host "File updated successfully"

# Show final counts
$finalAudit = (Get-Content $htmlFile | Select-String -SimpleMatch "audit-dashboard").Count
$finalReporting = (Get-Content $htmlFile | Select-String -SimpleMatch "reporting-analytics").Count
Write-Host "Final count - Audit Dashboard: $finalAudit, Reporting Analytics: $finalReporting"
