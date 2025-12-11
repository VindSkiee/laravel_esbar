# ESBAR ORDERING SYSTEM - ERD (Entity Relationship Diagram)

## Database Tables Structure

### 1. ADMINS
```
admins
├── id (PK, BIGINT, AUTO_INCREMENT)
├── username (VARCHAR 255, UNIQUE)
├── password_hash (VARCHAR 255)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Purpose**: Menyimpan data admin untuk authentication  
**Authentication**: Laravel Sanctum (token-based)

---

### 2. TABLES
```
tables
├── id (PK, BIGINT, AUTO_INCREMENT)
├── name (VARCHAR 255, UNIQUE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Purpose**: Menyimpan data meja restaurant (Meja 1 - Meja 20)  
**Business Logic**: Tidak bisa dihapus jika ada active orders

---

### 3. MENUS
```
menus
├── id (PK, BIGINT, AUTO_INCREMENT)
├── name (VARCHAR 255)
├── price (DECIMAL 10,2)
├── description (TEXT, NULLABLE)
├── category (ENUM: 'Makanan', 'Minuman', 'Es Krim')
├── image (VARCHAR 255, NULLABLE)
├── status (ENUM: 'Tersedia', 'Habis', DEFAULT 'Tersedia')
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Purpose**: Master data menu items  
**Image Storage**: `storage/app/public/menus/`  
**Business Logic**: Auto-delete image saat menu dihapus

---

### 4. CARTS
```
carts
├── id (PK, BIGINT, AUTO_INCREMENT)
├── table_id (FK -> tables.id, ON DELETE CASCADE)
├── menu_id (FK -> menus.id, ON DELETE CASCADE)
├── quantity (INTEGER, DEFAULT 1)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Purpose**: Temporary storage untuk shopping cart items  
**Scope**: Per table_id (isolated)  
**Business Logic**: 
- Cleared setelah checkout
- Session-based via customer session

---

### 5. ORDERS
```
orders
├── id (PK, BIGINT, AUTO_INCREMENT)
├── table_id (FK -> tables.id, ON DELETE CASCADE)
├── customer_name (VARCHAR 255)
├── payment_expires_at (TIMESTAMP, NULLABLE)
├── payment_transaction_id (VARCHAR 255, NULLABLE)
├── payment_qr_url (TEXT, NULLABLE)
├── payment_type (ENUM: 'qris', 'gopay', 'bca_va', NULLABLE)
├── paid_at (TIMESTAMP, NULLABLE)
├── status (ENUM: 'Menunggu Pembayaran', 'Sedang Disiapkan', 'Selesai', 'Dibatalkan')
├── total (DECIMAL 10,2)
├── tracking_code (VARCHAR 255, UNIQUE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Purpose**: Master order data  
**Tracking Code**: Format `ESB-XXXXX` (unique)  
**Payment Flow**: Midtrans integration  
**Business Logic**:
- Only cancellable if status: Menunggu Pembayaran or Sedang Disiapkan
- Auto-change to "Sedang Disiapkan" setelah payment success

---

### 6. ORDER_ITEMS
```
order_items
├── id (PK, BIGINT, AUTO_INCREMENT)
├── order_id (FK -> orders.id, ON DELETE CASCADE)
├── menu_id (FK -> menus.id, ON DELETE CASCADE)
├── quantity (INTEGER)
├── price (DECIMAL 10,2)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Purpose**: Detail items dalam order  
**Business Logic**: Price snapshot dari menu saat order dibuat

---

## Relationships

### One-to-Many Relationships

```
tables (1) ----< (many) carts
- One table can have many cart items
- Cascade delete: Delete table → Delete all carts

tables (1) ----< (many) orders
- One table can have many orders
- Cascade delete: Delete table → Delete all orders

menus (1) ----< (many) carts
- One menu can be in many carts
- Cascade delete: Delete menu → Delete from all carts

menus (1) ----< (many) order_items
- One menu can be in many order items
- Cascade delete: Delete menu → Delete from order items (snapshot preserved via price)

orders (1) ----< (many) order_items
- One order contains many items
- Cascade delete: Delete order → Delete all order items
```

### Authentication Relationships

```
admins (1) ----< (many) personal_access_tokens [Laravel Sanctum]
- One admin can have multiple active tokens
- Token-based authentication for API
```

---

## ER Diagram (ASCII)

```
┌─────────────┐
│   admins    │
├─────────────┤
│ id (PK)     │
│ username    │
│ password    │
│ timestamps  │
└─────────────┘
      │
      │ (Sanctum Tokens)
      │
      ▼
┌──────────────────┐
│ Laravel Sanctum  │
│ (Token Auth)     │
└──────────────────┘


┌─────────────┐           ┌─────────────┐
│   tables    │◄──────────┤   carts     │
├─────────────┤    1:N    ├─────────────┤
│ id (PK)     │           │ id (PK)     │
│ name        │           │ table_id FK │
│ timestamps  │           │ menu_id FK  │
└─────────────┘           │ quantity    │
      │                   │ timestamps  │
      │ 1:N               └─────────────┘
      │                          │
      ▼                          │ N:1
┌─────────────┐                  │
│   orders    │                  │
├─────────────┤                  │
│ id (PK)     │                  │
│ table_id FK │                  │
│ customer    │                  ▼
│ payment_*   │           ┌─────────────┐
│ status      │           │   menus     │
│ total       │           ├─────────────┤
│ tracking    │           │ id (PK)     │
│ timestamps  │           │ name        │
└─────────────┘           │ price       │
      │                   │ description │
      │ 1:N               │ category    │
      │                   │ image       │
      ▼                   │ status      │
┌─────────────┐           │ timestamps  │
│order_items  │           └─────────────┘
├─────────────┤                  ▲
│ id (PK)     │                  │
│ order_id FK │──────────────────┘
│ menu_id FK  │        N:1
│ quantity    │
│ price       │
│ timestamps  │
└─────────────┘
```

---

## Indexes

### Primary Keys
- All tables have `id` as primary key (auto-increment)

### Foreign Keys
- `carts.table_id` → `tables.id`
- `carts.menu_id` → `menus.id`
- `orders.table_id` → `tables.id`
- `order_items.order_id` → `orders.id`
- `order_items.menu_id` → `menus.id`

### Unique Indexes
- `admins.username`
- `tables.name`
- `orders.tracking_code`

### Recommended Additional Indexes (for performance)
```sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_carts_table_id ON carts(table_id);
CREATE INDEX idx_menus_category ON menus(category);
CREATE INDEX idx_menus_status ON menus(status);
```

---

## Data Flow

### Customer Journey Flow

```
1. Customer Session
   ↓
2. Browse Menus (menus table)
   ↓
3. Add to Cart (carts table - per table_id)
   ↓
4. Checkout (create order + order_items, clear carts)
   ↓
5. Payment (update orders with payment info)
   ↓
6. Midtrans Webhook (update paid_at, change status)
   ↓
7. Admin Process (update order status)
   ↓
8. Order Complete
```

### Admin Flow

```
1. Admin Login (admins table)
   ↓
2. Manage Menus (CRUD on menus table)
   ↓
3. Manage Tables (CRUD on tables table)
   ↓
4. View Dashboard (aggregate queries on orders)
   ↓
5. Process Orders (update order status)
   ↓
6. View Reports (analytics on orders, order_items)
```

---

## Database Size Estimation

Assuming:
- 20 tables
- 100 menus
- 500 orders/day
- Average 3 items per order
- 1 year operation

**Estimated Sizes:**
- admins: ~10 rows (< 1KB)
- tables: 20 rows (< 1KB)
- menus: 100 rows (~50KB)
- carts: ~100 active (varies, ~10KB avg)
- orders: 182,500 rows (1 year × 500/day) (~100MB)
- order_items: 547,500 rows (~300MB)

**Total**: ~400MB per year (excluding images)

**Images**: ~500KB per image × 100 menus = ~50MB

---

## Backup & Maintenance

**Recommended:**
- Daily backup of `orders` and `order_items`
- Weekly full database backup
- Monthly archive old orders (> 6 months) ke archive table
- Clean cart items > 24 hours old (scheduled task)

---

## Security Considerations

1. **Password Storage**: Bcrypt hashing for admin passwords
2. **Token Storage**: Laravel Sanctum personal_access_tokens table
3. **Payment Data**: No credit card data stored (handled by Midtrans)
4. **Cascade Deletes**: Be careful with table deletion (check active orders first)
5. **Soft Deletes**: Consider implementing for orders (audit trail)

---

**Database Version**: MySQL 8.0+  
**Charset**: utf8mb4  
**Collation**: utf8mb4_unicode_ci  
**Engine**: InnoDB (for foreign key support)
