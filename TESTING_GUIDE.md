# 🧪 TESTING GUIDE - ES BAR 79 Application

## ✅ STATUS APLIKASI

### Backend Laravel (http://127.0.0.1:8000)
- ✅ Database migrated & seeded
- ✅ Server running
- ✅ API endpoints ready
- ✅ Admin account created

### Frontend React (http://localhost:3000)
- ✅ Development server running
- ✅ Compiled without errors
- ✅ Connected to backend API

---

## 🔐 TEST 1: ADMIN AUTHENTICATION

### Akses Admin Panel
1. Buka browser: **http://localhost:3000/admin**
2. Login dengan kredensial:
   - **Username**: `admin`
   - **Password**: `admin123`
3. ✅ **Expected**: Redirect ke Admin Dashboard

### Verify Features:
- [ ] Login berhasil
- [ ] Token tersimpan di localStorage
- [ ] Redirect ke /admin/dashboard

---

## 👥 TEST 2: CUSTOMER FLOW

### A. Customer Login
1. Buka: **http://localhost:3000**
2. Input data:
   - **Nama**: `John Doe`
   - **Nomor Meja**: Pilih meja (contoh: Meja 1)
3. Klik **"Pesan Sekarang!"**
4. ✅ **Expected**: Redirect ke halaman Catalog

### Verify:
- [ ] Login sukses
- [ ] Customer name tersimpan
- [ ] Table ID tersimpan di session

### B. Browse Menu (Catalog)
1. Lihat daftar menu yang muncul
2. Test filter kategori (Es Krim, Minuman, Makanan)
3. Test search bar
4. ✅ **Expected**: Menu ter-load dari database

### Verify:
- [ ] Semua menu muncul
- [ ] Filter kategori bekerja
- [ ] Search bekerja
- [ ] Gambar menu tampil (jika ada)

### C. Add to Cart
1. Klik tombol **+** pada beberapa item menu
2. Lihat counter di tombol **"Keranjang (X)"** bertambah
3. Coba increase/decrease quantity
4. ✅ **Expected**: Cart update real-time

### Verify:
- [ ] Quantity bertambah
- [ ] Counter keranjang update
- [ ] Item tersimpan di backend cart

### D. View Cart
1. Klik tombol **"Keranjang"**
2. Review items di cart
3. Edit quantity (increase/decrease)
4. Test remove item
5. ✅ **Expected**: Cart management lancar

### Verify:
- [ ] Cart items tampil
- [ ] Total harga benar
- [ ] Edit quantity bekerja
- [ ] Remove item bekerja

---

## 💰 TEST 3: ORDER & PAYMENT

### A. Create Order
1. Di halaman Cart, klik **"Checkout"**
2. ✅ **Expected**: Order dibuat dan redirect ke payment page

### Verify:
- [ ] Order tersimpan di database
- [ ] Tracking code generated
- [ ] Redirect ke payment page

### B. Payment Flow
1. Review order details di payment page
2. Klik **"Sudah Bayar (Simulasi)"**
3. ✅ **Expected**: Payment confirmed

### Verify:
- [ ] QR code tampil (sandbox)
- [ ] Order ID dan total benar
- [ ] Confirmation berhasil

### C. Payment Success
1. Setelah confirm, lihat halaman success
2. Download/Print invoice
3. ✅ **Expected**: Success page dengan invoice

### Verify:
- [ ] Success message tampil
- [ ] Invoice bisa didownload
- [ ] Order status = "Sedang Disiapkan"

---

## 📊 TEST 4: ADMIN DASHBOARD

### A. View Active Orders
1. Login sebagai admin
2. Buka **Dashboard**
3. ✅ **Expected**: List order yang aktif (belum selesai)

### Verify:
- [ ] Orders tampil dengan detail
- [ ] Group by table
- [ ] Real-time updates (jika ada order baru)

### B. Update Order Status
1. Pilih order
2. Klik tombol status:
   - Sedang Disiapkan → Siap Disajikan
   - Siap Disajikan → Selesai
3. ✅ **Expected**: Status update instantly

### Verify:
- [ ] Status change berhasil
- [ ] UI update real-time
- [ ] Order pindah ke history (jika Selesai)

### C. View Order History
1. Klik menu **"History"**
2. Lihat semua order yang sudah selesai
3. Filter by date/table
4. ✅ **Expected**: History lengkap dengan detail

### Verify:
- [ ] Completed orders tampil
- [ ] Filter bekerja
- [ ] Detail order lengkap

---

## 🍽️ TEST 5: ADMIN MENU MANAGEMENT

### A. View All Menus
1. Login admin
2. Klik **"Menu"**
3. ✅ **Expected**: List semua menu items

### Verify:
- [ ] Semua menu tampil
- [ ] Filter kategori bekerja
- [ ] Filter status bekerja

### B. Add New Menu
1. Klik **"+ Tambah Menu"**
2. Fill form:
   - **Nama**: `Ice Cream Vanilla`
   - **Kategori**: `Es Krim`
   - **Harga**: `25000`
   - **Deskripsi**: `Creamy vanilla ice cream`
   - **Upload Image** (optional)
   - **Status**: `Tersedia`
3. Submit
4. ✅ **Expected**: Menu baru muncul di list

### Verify:
- [ ] Form validation bekerja
- [ ] Upload image berhasil
- [ ] Menu tersimpan ke database
- [ ] Tampil di list

### C. Edit Menu
1. Klik icon **Edit** pada menu
2. Ubah data (nama, harga, dll)
3. Submit
4. ✅ **Expected**: Update berhasil

### Verify:
- [ ] Form ter-fill dengan data lama
- [ ] Update berhasil
- [ ] Changes reflected di list

### D. Delete Menu
1. Klik icon **Delete**
2. Confirm delete
3. ✅ **Expected**: Menu terhapus

### Verify:
- [ ] Confirmation dialog muncul
- [ ] Menu terhapus dari database
- [ ] Hilang dari list

---

## 🪑 TEST 6: ADMIN TABLE MANAGEMENT

### A. View All Tables
1. Login admin
2. Klik **"Tables"**
3. ✅ **Expected**: List semua meja

### Verify:
- [ ] Semua tables tampil
- [ ] Status active order tampil

### B. Add New Table
1. Klik **"+ Tambah Meja"**
2. Input nomor: `10`
3. Submit
4. ✅ **Expected**: Table baru: "Meja 10"

### Verify:
- [ ] Validation bekerja (unique number)
- [ ] Table tersimpan
- [ ] Muncul di list

### C. Edit Table
1. Klik **Edit** pada table
2. Ubah nomor meja
3. Submit
4. ✅ **Expected**: Update berhasil

### Verify:
- [ ] Update berhasil
- [ ] No duplikasi nomor

### D. Delete Table
1. Klik **Delete**
2. ✅ **Expected**: 
   - ✅ Bisa delete jika tidak ada order aktif
   - ❌ Tidak bisa delete jika ada order aktif

### Verify:
- [ ] Validation bekerja
- [ ] Error message jika ada active orders

---

## 🔄 TEST 7: END-TO-END COMPLETE FLOW

### Full Customer + Admin Flow:
1. **Customer**: Login → Browse → Add to Cart → Checkout → Pay
2. **Admin**: See new order → Update status → Complete order
3. **Customer**: Receive completed order notification

### Verify Complete Integration:
- [ ] Customer flow smooth dari awal sampai akhir
- [ ] Admin bisa manage order real-time
- [ ] Database consistency
- [ ] No errors di console
- [ ] UI responsive

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Backend tidak konek
```powershell
# Restart Laravel server
cd C:\Code-project-learn\laravel_esbar
php artisan serve
```

### Issue 2: Frontend error
```powershell
# Restart React server
cd C:\Code-project-learn\laravel_esbar\frontend
npm start
```

### Issue 3: Cart tidak update
- Clear browser cache
- Clear localStorage
- Refresh page

### Issue 4: Image tidak tampil
```powershell
# Check storage link
php artisan storage:link
```

---

## ✅ CHECKLIST FINAL

Sebelum deploy/production, pastikan:
- [ ] Semua test di atas PASSED
- [ ] No console errors
- [ ] Database seeded dengan data lengkap
- [ ] CORS configured properly
- [ ] API endpoints semua berfungsi
- [ ] Frontend-backend integration perfect
- [ ] File uploads bekerja
- [ ] Session management bekerja
- [ ] Authentication secure

---

## 📝 NOTES

- **Admin Credentials**: username=`admin`, password=`admin123`
- **Backend**: http://127.0.0.1:8000
- **Frontend**: http://localhost:3000
- **Database**: SQLite (database/database.sqlite)

**SELAMAT TESTING! 🎉**
