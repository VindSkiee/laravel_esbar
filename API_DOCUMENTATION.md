# ESBAR ORDERING SYSTEM - API DOCUMENTATION

## Base URL
```
http://localhost:8000/api/v1
```

---

## 🔐 MODUL 1: AUTHENTICATION & SESSION

### 1.1 Admin Login
**POST** `/admin/login`

Request Body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin"
    },
    "token": "1|xxxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Note**: Token harus disimpan dan digunakan di header `Authorization: Bearer {token}` untuk endpoint admin.

### 1.2 Admin Logout
**POST** `/admin/logout`  
**Auth**: Bearer Token Required

### 1.3 Set Customer Session
**POST** `/session`

Request Body:
```json
{
  "customer_name": "John Doe",
  "table_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Session berhasil diset",
  "data": {
    "customer_name": "John Doe",
    "table": {
      "id": 1,
      "name": "Meja 1"
    }
  }
}
```

### 1.4 Get Customer Session
**GET** `/session`

---

## 🍽️ MODUL 2: MENU MANAGEMENT

### 2.1 Browse Menus (Customer & Admin)
**GET** `/menus`

Query Parameters:
- `category` (optional): Makanan, Minuman, Es Krim
- `status` (optional): Tersedia, Habis
- `search` (optional): Search by name

Example: `/menus?category=Makanan&status=Tersedia`

### 2.2 Get Menu Detail
**GET** `/menus/{id}`

### 2.3 Get Categories
**GET** `/menus/categories/list`

### 2.4 Create Menu (Admin Only) 🔒
**POST** `/admin/menus`  
**Auth**: Bearer Token Required

Request Body (multipart/form-data):
```json
{
  "name": "Nasi Goreng Spesial",
  "price": 25000,
  "description": "Nasi goreng dengan telur dan ayam",
  "category": "Makanan",
  "image": <file>,
  "status": "Tersedia"
}
```

### 2.5 Update Menu (Admin Only) 🔒
**POST** `/admin/menus/{id}`  
**Auth**: Bearer Token Required

### 2.6 Delete Menu (Admin Only) 🔒
**DELETE** `/admin/menus/{id}`  
**Auth**: Bearer Token Required

---

## 🪑 MODUL 3: TABLE MANAGEMENT

### 3.1 Get All Tables
**GET** `/tables`

### 3.2 Create Table (Admin Only) 🔒
**POST** `/admin/tables`  
**Auth**: Bearer Token Required

Request Body:
```json
{
  "name": "Meja 21"
}
```

### 3.3 Update Table (Admin Only) 🔒
**PUT** `/admin/tables/{id}`  
**Auth**: Bearer Token Required

### 3.4 Delete Table (Admin Only) 🔒
**DELETE** `/admin/tables/{id}`  
**Auth**: Bearer Token Required

---

## 🛒 MODUL 4: CART MANAGEMENT

**Note**: Semua cart endpoints require customer session (nama + table_id)

### 4.1 Get Cart Items
**GET** `/cart`

### 4.2 Add Item to Cart
**POST** `/cart`

Request Body:
```json
{
  "menu_id": 1,
  "quantity": 2
}
```

### 4.3 Update Cart Item Quantity
**PUT** `/cart/{id}`

Request Body:
```json
{
  "quantity": 3
}
```

### 4.4 Remove Item from Cart
**DELETE** `/cart/{id}`

### 4.5 Clear All Cart
**DELETE** `/cart`

---

## 📦 MODUL 5: ORDER MANAGEMENT

### 5.1 Create Order (Checkout)
**POST** `/orders`

Response:
```json
{
  "success": true,
  "message": "Order berhasil dibuat",
  "data": {
    "id": 1,
    "tracking_code": "ESB-ABCDE",
    "customer_name": "John Doe",
    "table": {
      "id": 1,
      "name": "Meja 1"
    },
    "items": [...],
    "total": 75000,
    "status": "Menunggu Pembayaran"
  }
}
```

### 5.2 Get Order by Tracking Code
**GET** `/orders/tracking/{trackingCode}`

### 5.3 Get Order History by Table
**GET** `/orders/history/table`

### 5.4 Get All Orders (Admin) 🔒
**GET** `/admin/orders`  
**Auth**: Bearer Token Required

Query Parameters:
- `status`: Filter by status
- `date`: Filter by date (YYYY-MM-DD)
- `table_id`: Filter by table
- `active`: true/false
- `per_page`: Pagination (default: 10)

### 5.5 Update Order Status (Admin) 🔒
**PUT** `/admin/orders/{id}/status`  
**Auth**: Bearer Token Required

Request Body:
```json
{
  "status": "Sedang Disiapkan"
}
```

Valid statuses:
- Menunggu Pembayaran
- Sedang Disiapkan
- Selesai
- Dibatalkan

### 5.6 Cancel Order
**POST** `/orders/{id}/cancel`

---

## 💳 MODUL 6: PAYMENT (MIDTRANS)

### 6.1 Create Payment
**POST** `/orders/{orderId}/payment`

Request Body:
```json
{
  "payment_type": "qris"
}
```

Valid payment types:
- `qris` - QRIS Payment
- `gopay` - GoPay E-Wallet
- `bca_va` - BCA Virtual Account

Response:
```json
{
  "success": true,
  "message": "Payment berhasil dibuat",
  "data": {
    "order_id": 1,
    "tracking_code": "ESB-ABCDE",
    "payment_url": "https://...",
    "snap_token": "xxxxx",
    "payment_type": "qris",
    "amount": 75000,
    "expires_at": "2024-12-12 15:45:00"
  }
}
```

### 6.2 Check Payment Status
**GET** `/orders/{orderId}/payment/status`

### 6.3 Payment Webhook (Midtrans Callback)
**POST** `/payment/webhook`

---

## 📊 MODUL 7: DASHBOARD & REPORTS (Admin Only) 🔒

**Auth**: Bearer Token Required for all dashboard endpoints

### 7.1 Dashboard Statistics
**GET** `/admin/dashboard/statistics`

Response:
```json
{
  "success": true,
  "data": {
    "today_orders": 15,
    "today_revenue": 450000,
    "active_orders": 5,
    "total_revenue": 2500000,
    "orders_by_status": {
      "Menunggu Pembayaran": 3,
      "Sedang Disiapkan": 2,
      "Selesai": 10
    },
    "top_menus": [...]
  }
}
```

### 7.2 Active Orders (Real-time)
**GET** `/admin/dashboard/active-orders`

### 7.3 Revenue Report
**GET** `/admin/dashboard/revenue-report`

Query Parameters:
- `start_date`: Required (YYYY-MM-DD)
- `end_date`: Required (YYYY-MM-DD)

### 7.4 Order History
**GET** `/admin/dashboard/order-history`

Query Parameters:
- `start_date`, `end_date`: Date range filter
- `status`: Status filter
- `table_id`: Table filter
- `per_page`: Pagination

---

## 🔄 COMPLETE CUSTOMER JOURNEY

### Step-by-Step Flow:

1. **Set Session**
   ```
   POST /session
   Body: { customer_name, table_id }
   ```

2. **Browse Menu**
   ```
   GET /menus?category=Makanan
   ```

3. **Add to Cart**
   ```
   POST /cart
   Body: { menu_id, quantity }
   ```

4. **View Cart**
   ```
   GET /cart
   ```

5. **Checkout (Create Order)**
   ```
   POST /orders
   ```

6. **Create Payment**
   ```
   POST /orders/{orderId}/payment
   Body: { payment_type: "qris" }
   ```

7. **Track Order**
   ```
   GET /orders/tracking/{trackingCode}
   ```

---

## 🔐 AUTHENTICATION

### Admin Endpoints
- Semua endpoint dengan prefix `/admin/` require Bearer Token
- Token didapat dari login admin
- Header: `Authorization: Bearer {token}`

### Customer Endpoints
- Tidak perlu authentication
- Menggunakan session-based (set via `/session`)
- Cart dan order terisolasi per table_id dalam session

---

## 🎯 STATUS CODES

- `200` - Success
- `201` - Created
- `401` - Unauthorized (token invalid/missing)
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## 📝 ERROR RESPONSE FORMAT

```json
{
  "message": "Error message",
  "errors": {
    "field_name": [
      "Validation error message"
    ]
  }
}
```

---

## 🚀 TESTING

### Default Admin Credentials:
- Username: `admin`
- Password: `admin123`

atau

- Username: `esbar_admin`
- Password: `esbar2024`

### Sample Tables:
- Meja 1 hingga Meja 20 (ID: 1-20)

### Sample Menus:
- 15 menu items across 3 categories
- Categories: Makanan, Minuman, Es Krim

---

## 🔔 REAL-TIME NOTIFICATIONS (TODO)

Socket.IO integration untuk:
- Admin: Notifikasi order baru, payment success
- Customer: Status update order
- Room isolation per table

---

## ⚠️ IMPORTANT NOTES

1. **Session Persistence**: Customer session (nama + table_id) disimpan di server session
2. **Cart Isolation**: Setiap table memiliki cart terpisah
3. **Payment Expiry**: Payment link expire dalam 15 menit (QRIS) atau 24 jam (VA)
4. **Order Cancellation**: Hanya order dengan status "Menunggu Pembayaran" atau "Sedang Disiapkan" yang bisa di-cancel
5. **Table Deletion**: Table tidak bisa dihapus jika memiliki active orders
6. **Image Upload**: Max 5MB, format: JPG/PNG
7. **Midtrans Config**: Set `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` di `.env`

---

## 📞 SUPPORT

Untuk pertanyaan atau issue, hubungi tim development ESBAR.
