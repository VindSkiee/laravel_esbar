$baseUrl = "http://127.0.0.1:8000/api"
$results = @()

Write-Host "`n=== TESTING LEGACY API ENDPOINTS ===`n" -ForegroundColor Cyan

# Test 1: Table List
Write-Host "[1/10] Testing GET /table/list..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/table/list" -Method GET
    $count = $response.Count
    Write-Host " OK ($count tables)" -ForegroundColor Green
    $results += "✓ GET /table/list"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ GET /table/list - $($_.Exception.Message)"
}

# Test 2: Set Table Session
Write-Host "[2/10] Testing POST /table/set..." -NoNewline
try {
    $body = @{table_id=1; table_name="Meja 1"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/table/set" -Method POST -Body $body -ContentType "application/json" -SessionVariable websession
    Write-Host " OK" -ForegroundColor Green
    $results += "✓ POST /table/set"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ POST /table/set - $($_.Exception.Message)"
}

# Test 3: Get Menus
Write-Host "[3/10] Testing GET /menu..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/menu" -Method GET
    $count = $response.data.Count
    Write-Host " OK ($count menus)" -ForegroundColor Green
    $results += "✓ GET /menu"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ GET /menu - $($_.Exception.Message)"
}

# Test 4: Add to Cart
Write-Host "[4/10] Testing POST /cart/add..." -NoNewline
try {
    $body = @{menu_id=1; quantity=2} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/cart/add" -Method POST -Body $body -ContentType "application/json" -WebSession $websession
    Write-Host " OK" -ForegroundColor Green
    $results += "✓ POST /cart/add"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ POST /cart/add - $($_.Exception.Message)"
}

# Test 5: Get Cart
Write-Host "[5/10] Testing GET /cart..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -WebSession $websession
    $count = $response.Count
    Write-Host " OK ($count items)" -ForegroundColor Green
    $results += "✓ GET /cart"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ GET /cart - $($_.Exception.Message)"
}

# Test 6: Update Cart
Write-Host "[6/10] Testing PUT /cart/update..." -NoNewline
try {
    $body = @{menu_id=1; quantity=3} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/cart/update" -Method PUT -Body $body -ContentType "application/json" -WebSession $websession
    Write-Host " OK" -ForegroundColor Green
    $results += "✓ PUT /cart/update"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ PUT /cart/update - $($_.Exception.Message)"
}

# Test 7: Create Order
Write-Host "[7/10] Testing POST /order/create..." -NoNewline
try {
    $body = @{customer_name="Test Customer"; order_type="dine_in"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/order/create" -Method POST -Body $body -ContentType "application/json" -WebSession $websession
    $orderId = $response.id
    Write-Host " OK (Order ID: $orderId)" -ForegroundColor Green
    $results += "✓ POST /order/create"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ POST /order/create - $($_.Exception.Message)"
}

# Test 8: Initiate Payment
Write-Host "[8/10] Testing POST /payment/initiate..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/payment/initiate/$orderId" -Method POST
    Write-Host " OK" -ForegroundColor Green
    $results += "✓ POST /payment/initiate"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ POST /payment/initiate - $($_.Exception.Message)"
}

# Test 9: Confirm Payment
Write-Host "[9/10] Testing POST /payment/test-confirm..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/payment/test-confirm/$orderId" -Method POST
    Write-Host " OK" -ForegroundColor Green
    $results += "✓ POST /payment/test-confirm"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ POST /payment/test-confirm - $($_.Exception.Message)"
}

# Test 10: Admin Login
Write-Host "[10/10] Testing POST /admin/login..." -NoNewline
try {
    $body = @{username="admin"; password="admin123"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/login" -Method POST -Body $body -ContentType "application/json"
    $token = $response.token
    Write-Host " OK (Token received)" -ForegroundColor Green
    $results += "✓ POST /admin/login"
    
    # Bonus: Test Admin Get Orders
    Write-Host "[BONUS] Testing GET /admin/orders/all..." -NoNewline
    $headers = @{Authorization="Bearer $token"}
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/orders/all" -Method GET -Headers $headers
    $count = $response.data.Count
    Write-Host " OK ($count orders)" -ForegroundColor Green
    $results += "✓ GET /admin/orders/all (with auth)"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "✗ POST /admin/login - $($_.Exception.Message)"
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$passed = ($results | Where-Object {$_ -match "^✓"}).Count
$failed = ($results | Where-Object {$_ -match "^✗"}).Count
$total = $results.Count

foreach ($result in $results) {
    if ($result -match "^✓") {
        Write-Host $result -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
    }
}

Write-Host "`nPassed: $passed/$total" -ForegroundColor $(if ($failed -eq 0) {"Green"} else {"Yellow"})
if ($failed -gt 0) {
    Write-Host "Failed: $failed/$total" -ForegroundColor Red
}

Write-Host "`n=== READY FOR FRONTEND ===" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "✓ All endpoints working!" -ForegroundColor Green
    Write-Host "✓ Backend ready for React frontend" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. cd frontend-esbar79-main/frontend"
    Write-Host "2. npm install"
    Write-Host "3. npm start"
    Write-Host "4. Open http://localhost:3000"
} else {
    Write-Host "⚠ Some endpoints failed. Fix errors above." -ForegroundColor Red
}
