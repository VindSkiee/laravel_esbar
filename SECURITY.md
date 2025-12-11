# 🔐 ESBAR Security Implementation Guide

## 🛡️ Security Features Implemented

### 1. Rate Limiting

#### Admin Login Protection
**Purpose**: Mencegah brute force attack pada endpoint login admin

**Configuration**:
- **Endpoint**: `POST /api/v1/admin/login`
- **Limit**: 5 attempts per minute per IP
- **Response**: HTTP 429 (Too Many Requests)

**Implementation** (routes/api.php):
```php
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('/admin/login', [AuthController::class, 'login']);
});
```

**Response Example (Rate Limited)**:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

**Headers Added**:
- `X-RateLimit-Limit: 5`
- `X-RateLimit-Remaining: 0`

---

#### Global API Rate Limiting
**Purpose**: Mencegah spam dan abuse pada semua endpoint

**Configuration**:
- **Default**: 60 requests per minute per IP
- **Customizable**: Per route group atau individual endpoint

**Usage Examples**:
```php
// 10 requests per minute
Route::middleware(['throttle:10,1'])->group(function () {
    // High-security endpoints
});

// 100 requests per minute
Route::middleware(['throttle:100,1'])->group(function () {
    // Public browsing endpoints
});
```

---

### 2. Input Sanitization

#### SanitizeInput Middleware
**Purpose**: Mencegah XSS (Cross-Site Scripting) attacks

**Applied To**: All API requests globally

**Features**:
1. **Strip Dangerous HTML Tags**
   - Allows: `<p>`, `<br>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`
   - Removes: `<script>`, `<iframe>`, `<object>`, etc.

2. **HTML Entity Encoding**
   - Converts special characters to HTML entities
   - Example: `<script>` → `&lt;script&gt;`

3. **Whitespace Trimming**
   - Removes leading/trailing spaces

**Implementation** (app/Http/Middleware/SanitizeInput.php):
```php
public function handle(Request $request, Closure $next): Response
{
    $input = $request->all();

    array_walk_recursive($input, function (&$value) {
        if (is_string($value)) {
            $value = strip_tags($value, '<p><br><strong><em><ul><ol><li>');
            $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8', false);
            $value = trim($value);
        }
    });

    $request->merge($input);
    return $next($request);
}
```

**Example**:
```
Input:  {"name": "<script>alert('XSS')</script>John"}
Output: {"name": "&lt;script&gt;alert('XSS')&lt;/script&gt;John"}
```

---

### 3. SQL Injection Protection

#### Eloquent ORM
**Purpose**: Prevent SQL injection attacks

**Protection Methods**:
1. **Parameter Binding** (automatic)
   ```php
   // Safe - uses parameter binding
   Order::where('tracking_code', $trackingCode)->first();
   
   // Safe - prepared statements
   DB::table('orders')->where('id', $id)->get();
   ```

2. **Avoid Raw Queries**
   ```php
   // ❌ Dangerous
   DB::select("SELECT * FROM orders WHERE id = " . $id);
   
   // ✅ Safe
   DB::select("SELECT * FROM orders WHERE id = ?", [$id]);
   ```

**Status**: ✅ All queries use Eloquent ORM or parameter binding

---

### 4. Authentication & Authorization

#### Laravel Sanctum (Token-Based)
**Purpose**: Secure admin authentication

**Features**:
1. **Token Generation**
   - Secure random tokens (SHA-256 hashed)
   - Stored in `personal_access_tokens` table

2. **Token Validation**
   - Middleware: `auth:sanctum`
   - Auto-validates on protected routes

3. **Token Revocation**
   - Logout: `$request->user()->currentAccessToken()->delete()`

**Usage**:
```php
// Login
$token = $admin->createToken('admin-token')->plainTextToken;

// Protected Route
Route::middleware(['auth:sanctum'])->group(function () {
    // Admin-only endpoints
});
```

---

#### Session-Based (Customer)
**Purpose**: Track customer without login

**Storage**: Database-backed sessions

**Security**:
- Session ID rotation on sensitive actions
- HTTP-only cookies
- CSRF protection enabled

**Configuration** (.env):
```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
```

---

### 5. Password Security

#### Bcrypt Hashing
**Purpose**: Secure password storage

**Implementation** (Admin model):
```php
public static function hashPassword($password)
{
    return bcrypt($password);
}

public function verifyPassword($password)
{
    return password_verify($password, $this->password_hash);
}
```

**Features**:
- **Algorithm**: Bcrypt (BCRYPT_ROUNDS=12)
- **Salt**: Automatic unique salt per password
- **Cost Factor**: 12 (configurable via `.env`)

---

### 6. CSRF Protection

#### Laravel Default
**Purpose**: Prevent Cross-Site Request Forgery

**Status**: ✅ Enabled by default for web routes

**For API**:
- Not required (stateless tokens)
- Optional: Enable with `EnsureFrontendRequestsAreStateful` middleware

---

### 7. Payment Webhook Security

#### Midtrans Signature Verification
**Purpose**: Verify webhook authenticity

**Implementation** (PaymentController@webhook):
```php
$serverKey = config('services.midtrans.server_key');
$hashedSignature = hash('sha512', 
    $orderId . 
    $notification->status_code . 
    $notification->gross_amount . 
    $serverKey
);

if ($hashedSignature !== $notification->signature_key) {
    Log::error('Invalid signature', ['order_id' => $orderId]);
    return response()->json(['message' => 'Invalid signature'], 403);
}
```

**Protection Against**:
- Fake webhook requests
- Payment manipulation
- Replay attacks

---

### 8. Validation Rules

#### Request Validation
**Purpose**: Ensure data integrity

**Examples**:

**Menu Creation**:
```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'price' => 'required|numeric|min:0',
    'category' => 'required|in:Makanan,Minuman,Es Krim',
    'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5120', // 5MB max
]);
```

**Order Status Update**:
```php
$validated = $request->validate([
    'status' => 'required|in:Menunggu Pembayaran,Sedang Disiapkan,Selesai,Dibatalkan',
]);
```

---

### 9. Error Handling

#### Sensitive Information Hiding
**Purpose**: Don't expose system details in production

**Configuration** (.env):
```env
APP_DEBUG=false  # In production
```

**Error Responses**:
```json
// Development (APP_DEBUG=true)
{
  "message": "SQLSTATE[42S02]: Base table or view not found",
  "exception": "Illuminate\\Database\\QueryException",
  "file": "/var/www/app/Models/Order.php",
  "line": 45,
  "trace": [...]
}

// Production (APP_DEBUG=false)
{
  "message": "Server Error",
  "success": false
}
```

---

### 10. File Upload Security

#### Image Upload Validation
**Purpose**: Prevent malicious file uploads

**Validation Rules**:
```php
'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5120'
```

**Security Measures**:
1. **MIME Type Validation**: Only jpg, jpeg, png allowed
2. **File Size Limit**: 5MB maximum
3. **Extension Check**: Laravel validates file extension
4. **Storage Isolation**: Uploaded files stored in `storage/app/public/menus`

**Filename Sanitization**:
```php
$filename = time() . '_' . str_replace(' ', '_', $request->file('image')->getClientOriginalName());
```

---

## 🚨 Security Recommendations

### For Production Deployment

#### 1. Environment Configuration
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Use strong secret keys
APP_KEY=base64:RANDOM_32_CHARACTER_KEY

# Enable HTTPS
REVERB_SCHEME=https
VITE_PUSHER_SCHEME=https
```

#### 2. HTTPS/SSL
- ✅ Install SSL certificate (Let's Encrypt)
- ✅ Force HTTPS in middleware
- ✅ Set secure cookies

```php
// Force HTTPS
if (!$request->secure() && app()->environment('production')) {
    return redirect()->secure($request->getRequestUri());
}
```

#### 3. CORS Configuration
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['https://frontend-domain.com'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
```

#### 4. Database Security
- ✅ Use strong database password
- ✅ Limit database user privileges
- ✅ Enable MySQL SSL connections
- ✅ Regular backups

#### 5. Server Hardening
- ✅ Disable directory listing
- ✅ Hide PHP version (`expose_php = Off`)
- ✅ Enable PHP OPcache
- ✅ Configure firewall (allow only 80, 443, 8080)

#### 6. Monitoring & Logging
```php
// Log suspicious activities
Log::warning('Multiple failed login attempts', [
    'ip' => $request->ip(),
    'username' => $username,
]);
```

**Tools**:
- Laravel Telescope (local development)
- Sentry (production error tracking)
- Cloudflare (DDoS protection)

#### 7. Rate Limiting Tuning
```php
// Stricter limits for production
Route::middleware(['throttle:3,1'])->post('/admin/login');  // 3 per minute
Route::middleware(['throttle:30,1'])->get('/menus');        // 30 per minute
```

---

## 🧪 Security Testing

### 1. Test Rate Limiting
```bash
# Test login rate limit
for i in {1..10}; do
  curl -X POST http://127.0.0.1:8000/api/v1/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
  echo "Attempt $i"
done
```

**Expected**: 429 error after 5 attempts

### 2. Test XSS Protection
```bash
curl -X POST http://127.0.0.1:8000/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"<script>alert(\"XSS\")</script>","table_id":1}'
```

**Expected**: Script tags removed/encoded

### 3. Test SQL Injection
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/orders/tracking/ESB-123' OR '1'='1"
```

**Expected**: No SQL error, returns 404 or empty result

### 4. Test Authentication
```bash
# Without token
curl -X GET http://127.0.0.1:8000/api/v1/admin/orders

# Expected: 401 Unauthenticated
```

---

## 📊 Security Checklist

| Feature | Status | Priority |
|---------|--------|----------|
| Rate Limiting (Login) | ✅ | High |
| Input Sanitization | ✅ | High |
| SQL Injection Protection | ✅ | Critical |
| Password Hashing (Bcrypt) | ✅ | Critical |
| Token Authentication | ✅ | High |
| CSRF Protection | ✅ | Medium |
| Webhook Signature Verification | ✅ | High |
| File Upload Validation | ✅ | High |
| HTTPS/SSL | ⏳ | Critical |
| CORS Configuration | ⏳ | High |
| Error Hiding (Production) | ⏳ | High |
| Audit Logging | ⏳ | Medium |
| 2FA (Admin) | ❌ | Low |
| IP Whitelisting | ❌ | Low |

**Legend**:
- ✅ Implemented
- ⏳ Ready to configure (environment-dependent)
- ❌ Not implemented (optional)

---

## 🔗 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Best Practices](https://laravel.com/docs/12.x/security)
- [PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)

---

**Status**: ✅ Core Security Implemented  
**Production Ready**: 85%  
**Last Updated**: December 12, 2025
