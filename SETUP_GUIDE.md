# 🚀 Setup Guide - Laravel ESBAR Project

Panduan lengkap untuk clone dan menjalankan aplikasi ES BAR 79.

---

## 📋 Prerequisites

Pastikan sudah terinstall:
- **PHP** >= 8.2
- **Composer**
- **Node.js** >= 16.x & npm
- **Git**

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/VindSkiee/laravel_esbar.git
cd laravel_esbar
```

---

## 2️⃣ Backend Setup (Laravel)

### Install Dependencies
```bash
composer install
```

### Setup Environment
```bash
# Copy .env example
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Configure .env
Edit file `.env` dan pastikan setting ini:

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:... # (auto-generated)
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database (SQLite - Simple)
DB_CONNECTION=sqlite
# DB_HOST, DB_PORT, DB_DATABASE tidak perlu jika pakai SQLite

# Broadcasting (Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=815828
REVERB_APP_KEY=hkpxtl9nyi8ewzaecyh2
REVERB_APP_SECRET=zyr4uvexfy8jeqmmvf19
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

# Session
SESSION_DRIVER=database
```

### Setup Database
```bash
# Create SQLite database file
New-Item -ItemType File -Path database/database.sqlite -Force

# Run migrations
php artisan migrate

# Seed data (menus, tables, admin user)
php artisan db:seed
```

### Create Storage Link
```bash
php artisan storage:link
```

### Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## 3️⃣ Frontend Setup (React)

### Navigate to Frontend
```bash
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Configure API URL (Optional)
File `frontend/src/api/config.js` sudah ter-configure ke `http://127.0.0.1:8000/api` secara default. Tidak perlu diubah untuk development.

---

## 4️⃣ Run Application

### Terminal 1: Backend (Laravel)
```bash
# Di root folder project
php artisan serve
```
**Backend akan jalan di**: `http://127.0.0.1:8000`

### Terminal 2: Frontend (React)
```bash
# Di folder frontend/
cd frontend
npm start
```
**Frontend akan jalan di**: `http://localhost:3000`

### Terminal 3 (Optional): Reverb (Real-time Broadcasting)
```bash
# Di root folder project
php artisan reverb:start
```
**Reverb akan jalan di**: `http://localhost:8080`

> **Note**: Reverb optional - aplikasi tetap berfungsi tanpa real-time. Admin dashboard menggunakan polling 10 detik sebagai fallback.

---

## 5️⃣ Access Application

### Customer Side
- **URL**: http://localhost:3000
- **Flow**: Login dengan nama dan nomor meja → Browse menu → Add to cart → Checkout → Payment

### Admin Panel
- **URL**: http://localhost:3000/admin
- **Username**: `admin`
- **Password**: `admin123`
- **Features**: 
  - Dashboard (view active orders)
  - Menu Management (CRUD)
  - Table Management (CRUD)
  - Order History

---

## 6️⃣ Default Seeded Data

### Admin Account
```
Username: admin
Password: admin123
```

### Tables
- Meja 1 sampai Meja 8 (8 tables)

### Menu Items
- 16 menu items terdiri dari:
  - Es Krim (Ice Cream)
  - Minuman (Beverages)
  - Makanan (Food)

---

## 🐛 Troubleshooting

### Error: "Database locked" atau migration gagal
```bash
# Hapus dan recreate database
Remove-Item database/database.sqlite -Force
New-Item -ItemType File -Path database/database.sqlite
php artisan migrate:fresh --seed
```

### Error: Frontend tidak bisa connect ke backend
- Pastikan Laravel server jalan di `http://127.0.0.1:8000`
- Cek CORS sudah enabled di backend
- Clear browser cache (Ctrl + Shift + R)

### Error: Images tidak muncul
```bash
php artisan storage:link
```

### Port sudah terpakai
**Backend (Laravel):**
```bash
php artisan serve --port=8001
```

**Frontend (React):**
```bash
# Set PORT environment variable
$env:PORT=3001; npm start
```

---

## 📁 Project Structure

```
laravel_esbar/
├── app/                    # Laravel application code
│   ├── Events/            # Broadcasting events
│   ├── Http/              # Controllers & Middleware
│   └── Models/            # Eloquent models
├── database/              # Migrations & seeders
│   ├── migrations/
│   └── seeders/
├── frontend/              # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       │   ├── admin/    # Admin panel
│       │   └── ...       # Customer components
│       └── api/          # API config
├── routes/
│   ├── api.php           # API routes
│   └── legacy-api.php    # Legacy compatibility
├── public/
│   └── storage/          # Symlink to storage/app/public
└── storage/
    └── app/public/menus/ # Uploaded menu images
```

---

## 🔒 Security Notes

- **NEVER commit `.env` file** (already in .gitignore)
- Change default admin password in production
- Set `APP_DEBUG=false` in production
- Configure proper CORS settings for production domain
- Use HTTPS in production

---

## 📚 Documentation

- **API Documentation**: `API_DOCUMENTATION.md`
- **Database ERD**: `DATABASE_ERD.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Security Guide**: `SECURITY.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION.md`

---

## 🤝 Collaboration Workflow

### Untuk Development
1. Clone repo
2. Create branch baru: `git checkout -b feature/nama-fitur`
3. Develop & test
4. Commit: `git commit -m "Add: deskripsi fitur"`
5. Push: `git push origin feature/nama-fitur`
6. Create Pull Request di GitHub

### Setelah Ada Update dari Main
```bash
git checkout main
git pull origin main
composer install          # Update backend dependencies
cd frontend && npm install  # Update frontend dependencies
php artisan migrate       # Run new migrations if any
```

---

## ✅ Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/VindSkiee/laravel_esbar.git
cd laravel_esbar

# 2. Backend Setup
composer install
cp .env.example .env
php artisan key:generate
New-Item -ItemType File -Path database/database.sqlite
php artisan migrate --seed
php artisan storage:link

# 3. Frontend Setup
cd frontend
npm install
cd ..

# 4. Run (2 terminals)
# Terminal 1:
php artisan serve

# Terminal 2:
cd frontend && npm start

# 5. Access
# Customer: http://localhost:3000
# Admin: http://localhost:3000/admin (admin/admin123)
```

---

**Happy Coding! 🎉**
