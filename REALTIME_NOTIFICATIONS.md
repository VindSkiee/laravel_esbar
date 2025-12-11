# 🔔 ESBAR Real-Time Notifications - Broadcasting Guide

## 📡 Architecture Overview

ESBAR menggunakan **Laravel Reverb** (WebSocket server bawaan Laravel) untuk real-time notifications. Ini menggantikan kebutuhan Socket.IO eksternal.

### Event Broadcasting Flow

```
Customer/Admin Action 
    ↓
Controller dispatches Event
    ↓
Laravel Broadcasting
    ↓
Reverb WebSocket Server
    ↓
Frontend receives notification via Laravel Echo
```

---

## 🎯 Events yang Sudah Diimplementasi

### 1. OrderCreatedEvent
**Trigger**: Ketika customer membuat order baru (checkout)  
**Channels**: 
- `admin-orders` (public) - Admin menerima notifikasi
- `table.{table_id}` (private) - Customer di meja tersebut menerima konfirmasi

**Payload**:
```json
{
  "order_id": 1,
  "tracking_code": "ESB-12345",
  "table_id": 5,
  "customer_name": "John Doe",
  "total": 45000,
  "status": "Menunggu Pembayaran",
  "created_at": "2025-12-12T10:00:00.000000Z",
  "message": "Pesanan baru dari John Doe (Meja 5)"
}
```

---

### 2. PaymentSuccessEvent
**Trigger**: Ketika pembayaran berhasil (dari webhook Midtrans)  
**Channels**: 
- `admin-orders` (public) - Admin menerima notifikasi payment success
- `table.{table_id}` (private) - Customer menerima konfirmasi payment

**Payload**:
```json
{
  "order_id": 1,
  "tracking_code": "ESB-12345",
  "table_id": 5,
  "customer_name": "John Doe",
  "transaction_id": "ESB-12345-1702345678",
  "payment_type": "qris",
  "paid_at": "2025-12-12T10:05:00.000000Z",
  "status": "Sedang Disiapkan",
  "message": "Pembayaran berhasil untuk pesanan ESB-12345"
}
```

---

### 3. OrderStatusUpdatedEvent
**Trigger**: Ketika admin mengubah status order  
**Channels**: 
- `admin-orders` (public) - Admin lain menerima update
- `table.{table_id}` (private) - Customer menerima update status

**Payload**:
```json
{
  "order_id": 1,
  "tracking_code": "ESB-12345",
  "table_id": 5,
  "customer_name": "John Doe",
  "old_status": "Sedang Disiapkan",
  "new_status": "Siap Disajikan",
  "updated_at": "2025-12-12T10:15:00.000000Z",
  "message": "Pesanan siap disajikan"
}
```

---

## 🚀 Setup Instructions

### 1. Start Reverb Server

```bash
php artisan reverb:start
```

Server akan berjalan di:
- Host: `127.0.0.1`
- Port: `8080`
- Protocol: `http` (untuk development)

### 2. Test Broadcasting

```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Start Reverb server
php artisan reverb:start

# Terminal 3: Start Queue Worker (untuk background jobs)
php artisan queue:work
```

### 3. Environment Configuration

`.env` sudah dikonfigurasi dengan:

```env
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=sync

REVERB_APP_ID=558226
REVERB_APP_KEY=l3ua4o6eyhpkrs5t9qec
REVERB_APP_SECRET=synrvkfr8haaf6fyfioj
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

---

## 📱 Frontend Integration (Laravel Echo)

### Install Dependencies

```bash
npm install --save-dev laravel-echo pusher-js
```

### Setup Laravel Echo (JavaScript)

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

---

## 👨‍💼 Admin Frontend Example

### Listen to New Orders

```javascript
// Subscribe to admin orders channel
Echo.channel('admin-orders')
    .listen('.order.created', (data) => {
        console.log('New order received:', data);
        
        // Show notification
        showNotification({
            title: 'Pesanan Baru',
            message: data.message,
            type: 'info'
        });
        
        // Update order list
        refreshOrderList();
        
        // Play sound
        playNotificationSound();
    })
    .listen('.payment.success', (data) => {
        console.log('Payment received:', data);
        
        showNotification({
            title: 'Pembayaran Diterima',
            message: data.message,
            type: 'success'
        });
        
        refreshOrderList();
    })
    .listen('.order.status.updated', (data) => {
        console.log('Order status updated:', data);
        
        // Update specific order in UI
        updateOrderStatus(data.order_id, data.new_status);
    });
```

---

## 👤 Customer Frontend Example

### Listen to Order Updates for Specific Table

```javascript
// Assume tableId is stored in session/localStorage
const tableId = localStorage.getItem('table_id');

// Subscribe to private table channel
Echo.private(`table.${tableId}`)
    .listen('.order.created', (data) => {
        console.log('Order created:', data);
        
        // Show success message
        showSuccessMessage('Pesanan berhasil dibuat!');
        
        // Redirect to order tracking
        window.location.href = `/order/${data.tracking_code}`;
    })
    .listen('.payment.success', (data) => {
        console.log('Payment success:', data);
        
        showSuccessMessage('Pembayaran berhasil! Pesanan sedang disiapkan.');
        
        // Update order status in UI
        updateOrderUI(data);
    })
    .listen('.order.status.updated', (data) => {
        console.log('Order status updated:', data);
        
        // Show status update notification
        showNotification({
            title: 'Update Pesanan',
            message: data.message,
            type: 'info'
        });
        
        // Update UI with new status
        document.getElementById('order-status').textContent = data.new_status;
    });
```

---

## 🔒 Channel Authorization

### Private Channels (Customer)

File: `routes/channels.php`

```php
// Customer can only listen to their own table channel
Broadcast::channel('table.{tableId}', function ($user, $tableId) {
    // For now allows all (guests don't authenticate)
    // In production, verify session ownership
    return true;
});
```

### Public Channels (Admin)

```php
// All admins can listen to admin orders
Broadcast::channel('admin-orders', function () {
    return true;
});
```

---

## 🧪 Testing Broadcasts

### Method 1: Artisan Tinker

```bash
php artisan tinker
```

```php
use App\Models\Order;
use App\Events\OrderCreatedEvent;

$order = Order::with(['items.menu', 'table'])->first();
event(new OrderCreatedEvent($order));
```

### Method 2: API Testing

```bash
# Create an order (triggers OrderCreatedEvent)
curl -X POST http://127.0.0.1:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: laravel_session=YOUR_SESSION_COOKIE"

# Update order status (triggers OrderStatusUpdatedEvent)
curl -X PUT http://127.0.0.1:8000/api/v1/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"status": "Sedang Disiapkan"}'
```

### Method 3: Browser Console

```javascript
// In browser console (after Echo setup)
Echo.channel('admin-orders')
    .listen('.order.created', console.log)
    .listen('.payment.success', console.log)
    .listen('.order.status.updated', console.log);

// Then trigger events via API
```

---

## 📊 Performance & Scaling

### Current Configuration

- **Concurrent Connections**: 100 (default Reverb)
- **Max Message Size**: 10KB
- **Rate Limiting**: 10 events/second per connection

### Production Recommendations

1. **Use SSL/TLS**: Change `REVERB_SCHEME=https`
2. **Increase Connections**: Modify Reverb config
3. **Add Redis**: For horizontal scaling
4. **Monitor Performance**: Use Laravel Telescope

---

## 🛠️ Troubleshooting

### Issue: Events not broadcasting

**Solution**:
```bash
# Clear config cache
php artisan config:clear

# Restart Reverb
php artisan reverb:restart
```

### Issue: Frontend can't connect

**Check**:
1. Reverb server is running
2. Port 8080 is not blocked
3. Correct credentials in `.env`

### Issue: Private channel authorization fails

**Debug**:
```javascript
Echo.private('table.1')
    .error((error) => {
        console.error('Channel error:', error);
    });
```

---

## 📈 Monitoring

### View Active Connections

```bash
php artisan reverb:status
```

### Check Logs

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Reverb logs (console output)
```

---

## 🎯 Next Steps

1. ✅ Backend broadcasting setup (COMPLETED)
2. ⏳ Frontend Laravel Echo integration
3. ⏳ Admin dashboard real-time UI
4. ⏳ Customer order tracking page
5. ⏳ Production deployment with SSL

---

## 📝 Event Dispatch Locations

| Event | Triggered In | Line |
|-------|--------------|------|
| OrderCreatedEvent | OrderController@store | After order creation |
| PaymentSuccessEvent | PaymentController@setOrderAsPaid | After payment confirmed |
| OrderStatusUpdatedEvent | OrderController@updateStatus | After status change |
| OrderStatusUpdatedEvent | OrderController@cancel | After order cancelled |

---

## 🔗 Related Documentation

- [Laravel Broadcasting Docs](https://laravel.com/docs/12.x/broadcasting)
- [Laravel Reverb Docs](https://laravel.com/docs/12.x/reverb)
- [Laravel Echo Docs](https://laravel.com/docs/12.x/broadcasting#client-side-installation)

---

**Status**: ✅ Backend Setup Complete  
**Next**: Frontend Integration  
**Updated**: December 12, 2025
