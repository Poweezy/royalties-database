$appJsPath = ".\app.js"
$content = Get-Content $appJsPath -Raw

# Fix method declarations in RoyaltiesApp class
$methodPattern = '(\r?\n[ \t]*)([a-zA-Z][a-zA-Z0-9_]*\([^)]*\)) \{'
$replacement = '$1$2 {'

# First set of replacements - add semicolons to end of method blocks
$content = $content -replace '(\r?\n[ \t]*})\r?\n[ \t]*([a-zA-Z][a-zA-Z0-9_]*\([^)]*\))', '$1;$2'

# Second set of replacements - add semicolons for class-ending methods
$content = $content -replace '(\r?\n[ \t]*})\r?\n\}', '$1;$2'

# Write the updated content back to the file
Set-Content -Path $appJsPath -Value $content

Write-Host "Fixed method declarations in app.js"
