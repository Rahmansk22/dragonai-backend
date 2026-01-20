$body = @{ prompt = "a cat" } | ConvertTo-Json
$headers = @{
    "Content-Type" = "application/json"
}
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/image/generate" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error Status: $($_.Exception.Response.StatusCode.Value)"
    Write-Host "Error: $($_.Exception.Response.StatusCode)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $content = $reader.ReadToEnd()
        Write-Host "Error Response: $content"
    } catch {}
}
