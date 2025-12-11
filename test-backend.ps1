# Backend API Testing Script

Write-Host "=== Testing Laravel Backend API ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://127.0.0.1:8000/api"

# Test 1: Admin Login
Write-Host "1. Testing Admin Login..." -ForegroundColor Yellow
try {
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    $token = $response.token
    Write-Host "✓ Login Success! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
    
    # Test 2: Get Tables
    Write-Host "`n2. Testing Get Tables..." -ForegroundColor Yellow
    $tables = Invoke-RestMethod -Uri "$baseUrl/table/list" -Method GET
    Write-Host "✓ Tables loaded: $($tables.Count) tables" -ForegroundColor Green
    
    # Test 3: Get Menus
    Write-Host "`n3. Testing Get Menus..." -ForegroundColor Yellow
    $menus = Invoke-RestMethod -Uri "$baseUrl/menu" -Method GET
    Write-Host "✓ Menus loaded: $($menus.data.Count) items" -ForegroundColor Green
    
    # Test 4: Admin Get All Orders (with token)
    Write-Host "`n4. Testing Admin Get Orders..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    $orders = Invoke-RestMethod -Uri "$baseUrl/admin/orders/all" -Method GET -Headers $headers
    Write-Host "✓ Orders loaded: $($orders.data.Count) orders" -ForegroundColor Green
    
    # Test 5: Admin Get Menus
    Write-Host "`n5. Testing Admin Get Menus..." -ForegroundColor Yellow
    $adminMenus = Invoke-RestMethod -Uri "$baseUrl/admin/menus" -Method GET -Headers $headers
    Write-Host "✓ Admin menus loaded: $($adminMenus.data.Count) items" -ForegroundColor Green
    
    # Test 6: Admin Get Tables
    Write-Host "`n6. Testing Admin Get Tables..." -ForegroundColor Yellow
    $adminTables = Invoke-RestMethod -Uri "$baseUrl/admin/tables" -Method GET -Headers $headers
    Write-Host "✓ Admin tables loaded: $($adminTables.data.Count) tables" -ForegroundColor Green
    
    Write-Host "`n=== ALL TESTS PASSED! ===" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
