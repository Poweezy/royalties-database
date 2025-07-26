# Simple script to remove duplicate sections by removing specific line ranges
$htmlFile = "c:\Users\Mabutfo Dlamini\Desktop\royalties-database\royalties.html"
$lines = Get-Content $htmlFile

Write-Host "Original file has $($lines.Count) lines"

# Remove duplicate audit-dashboard section (around line 1471)
# Find the start and end of this section
$auditStart = -1
$auditEnd = -1

for ($i = 1470; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'section id="audit-dashboard"' -and $auditStart -eq -1) {
        # Find the comment before it
        for ($j = $i - 1; $j -ge 0; $j--) {
            if ($lines[$j] -match '<!-- Audit Dashboard -->') {
                $auditStart = $j
                break
            }
        }
        break
    }
}

for ($i = $auditStart + 1; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '</section>' -and $lines[$i + 1] -match '<!-- Reporting & Analytics -->') {
        $auditEnd = $i
        break
    }
}

if ($auditStart -gt -1 -and $auditEnd -gt -1) {
    Write-Host "Removing duplicate audit-dashboard section from line $($auditStart + 1) to $($auditEnd + 1)"
    $lines = $lines[0..($auditStart - 1)] + $lines[($auditEnd + 1)..($lines.Count - 1)]
    Write-Host "After audit removal: $($lines.Count) lines"
}

# Remove duplicate reporting-analytics section
$reportStart = -1
$reportEnd = -1

for ($i = 1500; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'section id="reporting-analytics"' -and $reportStart -eq -1) {
        # Find the comment before it
        for ($j = $i - 1; $j -ge 0; $j--) {
            if ($lines[$j] -match '<!-- Reporting & Analytics -->') {
                $reportStart = $j
                break
            }
        }
        break
    }
}

for ($i = $reportStart + 1; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '</section>' -and ($lines[$i + 1] -match '<!-- (?!Reporting)' -or $lines[$i + 2] -match '<!-- (?!Reporting)')) {
        $reportEnd = $i
        break
    }
}

if ($reportStart -gt -1 -and $reportEnd -gt -1) {
    Write-Host "Removing duplicate reporting-analytics section from line $($reportStart + 1) to $($reportEnd + 1)"
    $lines = $lines[0..($reportStart - 1)] + $lines[($reportEnd + 1)..($lines.Count - 1)]
    Write-Host "After reporting removal: $($lines.Count) lines"
}

# Write the cleaned content back
Set-Content $htmlFile $lines -Encoding UTF8
Write-Host "File cleanup completed"

# Verify the results
$finalLines = Get-Content $htmlFile
Write-Host "Final file has $($finalLines.Count) lines"

$auditCount = ($finalLines | Select-String -SimpleMatch "audit-dashboard").Count
$reportCount = ($finalLines | Select-String -SimpleMatch "reporting-analytics").Count
Write-Host "Final counts - audit-dashboard: $auditCount, reporting-analytics: $reportCount"
