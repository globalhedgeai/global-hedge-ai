# PowerShell integration test script for deposits endpoint
# Tests both multipart/form-data and JSON endpoints

$baseUrl = "http://localhost:3001"
$cookieJar = "cookies.txt"

# Clean up any existing cookie jar
if (Test-Path $cookieJar) {
    Remove-Item $cookieJar
}

Write-Host "=== Deposit API Integration Test ===" -ForegroundColor Green

# Create a 1x1 PNG temp file
$tempPng = "temp-proof.png"
$pngData = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
[System.IO.File]::WriteAllBytes($tempPng, $pngData)

try {
    Write-Host "`n1. Testing login..." -ForegroundColor Yellow
    $loginResponse = cmd.exe /c "curl -s -c `"$cookieJar`" -X POST `"$baseUrl/api/auth/login`" -H `"Content-Type: application/json`" -d `"{\`"email\`":\`"test@example.com\`",\`"password\`":\`"password123\`"}`""
    Write-Host "Login response: $loginResponse" -ForegroundColor Cyan

    Write-Host "`n2. Testing multipart deposit..." -ForegroundColor Yellow
    $depositResponse = cmd.exe /c "curl -s -b `"$cookieJar`" -X POST `"$baseUrl/api/deposits`" -F `"amount=25.50`" -F `"txId=TEST-TX-123`" -F `"network=TRC20`" -F `"proof=@$tempPng;type=image/png`""
    Write-Host "Deposit response: $depositResponse" -ForegroundColor Cyan

    Write-Host "`n3. Testing GET deposits..." -ForegroundColor Yellow
    $getResponse = cmd.exe /c "curl -s -b `"$cookieJar`" -X GET `"$baseUrl/api/deposits`""
    Write-Host "GET deposits response: $getResponse" -ForegroundColor Cyan

    Write-Host "`n4. Testing JSON deposit..." -ForegroundColor Yellow
    $jsonDepositResponse = cmd.exe /c "curl -s -b `"$cookieJar`" -X POST `"$baseUrl/api/deposits`" -H `"Content-Type: application/json`" -d `"{\`"amount\`":15.75,\`"txId\`":\`"JSON-TX-456\`",\`"network\`":\`"TRC20\`",\`"proofImageUrl\`":\`"https://example.com/proof.jpg\`"}`""
    Write-Host "JSON deposit response: $jsonDepositResponse" -ForegroundColor Cyan

    Write-Host "`n5. Testing unauthenticated access..." -ForegroundColor Yellow
    $unauthResponse = cmd.exe /c "curl -s -X GET `"$baseUrl/api/deposits`""
    Write-Host "Unauthenticated response: $unauthResponse" -ForegroundColor Cyan

    Write-Host "`n=== Test Complete ===" -ForegroundColor Green
} finally {
    # Clean up
    if (Test-Path $tempPng) {
        Remove-Item $tempPng
    }
    if (Test-Path $cookieJar) {
        Remove-Item $cookieJar
    }
}
