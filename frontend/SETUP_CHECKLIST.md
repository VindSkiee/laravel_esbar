# 📋 Checklist Setup Project ES BAR 79

## ✅ Langkah-langkah Setup

### 1️⃣ Install Dependencies

```bash
cd frontend
npm install
```

### 2️⃣ Siapkan Gambar Assets

Letakkan gambar-gambar berikut di folder `frontend/src/assets/`:

- [ ] **ice-cream.png**

  - Gambar 3 ice cream cones (cokelat, strawberry, mint)
  - Ukuran minimal: 600x600px
  - Format: PNG dengan background transparan

- [ ] **strawberry.png**

  - Gambar strawberry untuk dekorasi
  - Ukuran: 200x200px
  - Format: PNG dengan background transparan

- [ ] **mint.png**

  - Gambar daun mint untuk dekorasi
  - Ukuran: 200x200px
  - Format: PNG dengan background transparan

- [ ] **blueberry.png**

  - Gambar blueberry untuk dekorasi
  - Ukuran: 200x200px
  - Format: PNG dengan background transparan

- [ ] **candy-cane.png**
  - Gambar permen tongkat untuk dekorasi
  - Ukuran: 200x200px
  - Format: PNG dengan background transparan

### 3️⃣ Jalankan Aplikasi

```bash
npm start
```

### 4️⃣ Buka Browser

Aplikasi akan terbuka otomatis di: `http://localhost:3000`

## 🎨 Tips untuk Gambar

### Cara Mendapatkan Gambar:

1. **Screenshot dari Figma/Design** - Jika Anda punya desain
2. **Download dari stock images** - Freepik, Pexels, Unsplash
3. **Generate AI** - Midjourney, DALL-E, Stable Diffusion
4. **Edit sendiri** - Photoshop, Canva, Figma

### Format Terbaik:

- **Format:** PNG
- **Background:** Transparan
- **Kualitas:** High Resolution
- **Ukuran file:** < 500KB per gambar

### Tools untuk Remove Background:

- https://remove.bg
- Photoshop
- Canva (Pro)
- GIMP (gratis)

## 🔧 Troubleshooting

### Error: "Module not found: Can't resolve '../assets/...'"

**Solusi:** Pastikan gambar sudah ditempatkan di folder `src/assets/` dengan nama yang benar.

### Gambar tidak muncul

**Solusi:**

1. Check console browser untuk error
2. Pastikan nama file exact match (case-sensitive)
3. Clear cache browser (Ctrl + Shift + R)

### Aplikasi tidak jalan

**Solusi:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

## 📱 Testing

### Desktop

- [ ] Test di Chrome
- [ ] Test di Firefox
- [ ] Test di Safari (jika Mac)

### Mobile

- [ ] Test di Chrome Mobile
- [ ] Test di Safari Mobile
- [ ] Test di berbagai ukuran screen

### Functionality

- [ ] Input Nama berfungsi
- [ ] Input Nomor Meja berfungsi
- [ ] Button "Pesan Sekarang!" berfungsi
- [ ] Form validation berfungsi
- [ ] Hover effect pada button

## 🚀 Next Steps

Setelah halaman login selesai:

1. Buat halaman menu (untuk melihat daftar ice cream)
2. Buat halaman keranjang (shopping cart)
3. Buat halaman konfirmasi pesanan
4. Integrasi dengan backend Node.js

## 📞 Butuh Bantuan?

Jika ada masalah atau pertanyaan:

1. Check error di browser console (F12)
2. Check error di terminal
3. Baca dokumentasi React: https://react.dev
4. Tanya tim backend tentang integrasi API

---

**Good Luck! 🍦☕**
