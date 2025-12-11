# 📸 PANDUAN MEMASUKKAN GAMBAR - ES BAR 79

## 📂 LOKASI FOLDER

Letakkan SEMUA gambar di folder ini:

```
D:\Tubes_PTI\ice-cream-79\frontend\src\assets\
```

## 🖼️ DAFTAR GAMBAR YANG DIBUTUHKAN

### 1. ice-cream.png ⭐ (GAMBAR UTAMA - WAJIB!)

**Deskripsi:** Gambar 3 ice cream cones

- Cone 1 (kiri): Cokelat
- Cone 2 (tengah): Pink/Strawberry
- Cone 3 (kanan): Hijau/Mint

**Spesifikasi:**

- Nama file: `ice-cream.png` (huruf kecil semua!)
- Format: PNG dengan background transparan
- Ukuran: Minimal 600x600px, ideal 800x800px atau 1000x1000px
- Posisi: Akan muncul di ATAS card login

**Cara extract dari design Anda:**

1. Buka design/screenshot di Photopea (https://photopea.com)
2. Crop bagian 3 ice cream cones saja
3. Remove background (Select → Delete background layer)
4. Export as PNG
5. Save dengan nama: `ice-cream.png`

---

### 2. strawberry.png 🍓 (OPSIONAL - untuk dekorasi)

**Deskripsi:** Gambar strawberry untuk dekorasi di background merah

**Spesifikasi:**

- Nama file: `strawberry.png`
- Format: PNG dengan background transparan
- Ukuran: 200x200px atau 300x300px
- Akan muncul: Di pojok-pojok background merah

---

### 3. mint.png 🌿 (OPSIONAL - untuk dekorasi)

**Deskripsi:** Gambar daun mint untuk dekorasi

**Spesifikasi:**

- Nama file: `mint.png`
- Format: PNG dengan background transparan
- Ukuran: 200x200px atau 300x300px
- Akan muncul: Di area background merah

---

### 4. blueberry.png 🫐 (OPSIONAL - untuk dekorasi)

**Deskripsi:** Gambar blueberry untuk dekorasi

**Spesifikasi:**

- Nama file: `blueberry.png`
- Format: PNG dengan background transparan
- Ukuran: 150x200px
- Akan muncul: Di pojok kanan bawah

---

### 5. candy-cane.png 🍬 (OPSIONAL - untuk dekorasi)

**Deskripsi:** Gambar permen tongkat merah-putih

**Spesifikasi:**

- Nama file: `candy-cane.png`
- Format: PNG dengan background transparan
- Ukuran: 100x200px (portrait/vertikal)
- Akan muncul: Di area bawah

---

## 📋 CHECKLIST LANGKAH-LANGKAH

### ✅ Step 1: Extract Gambar dari Design

- [ ] Buka design/screenshot Anda
- [ ] Screenshot atau crop bagian ice cream (3 cones)
- [ ] Extract gambar dekorasi lainnya (strawberry, mint, dll)

### ✅ Step 2: Remove Background (Pilih salah satu)

**Cara Mudah - Online (REKOMENDASI):**

1. Buka https://remove.bg
2. Upload gambar yang sudah di-crop
3. Download hasil (background otomatis transparan)
4. Rename file sesuai nama yang dibutuhkan

**Cara Manual - Photopea:**

1. Buka https://photopea.com
2. Upload gambar
3. Select background dengan Magic Wand (W)
4. Delete (atau Select → Inverse → Copy → New Document)
5. File → Export as → PNG
6. Rename sesuai nama yang dibutuhkan

### ✅ Step 3: Rename File

Pastikan nama file EXACT seperti ini:

- `ice-cream.png` ← WAJIB!
- `strawberry.png` ← opsional
- `mint.png` ← opsional
- `blueberry.png` ← opsional
- `candy-cane.png` ← opsional

⚠️ **PENTING:**

- Huruf KECIL semua
- Gunakan dash (-) bukan spasi
- Extension .png

### ✅ Step 4: Copy File ke Folder Assets

1. Copy semua file PNG yang sudah siap
2. Paste ke folder:
   ```
   D:\Tubes_PTI\ice-cream-79\frontend\src\assets\
   ```

### ✅ Step 5: Refresh Browser

- Browser akan otomatis reload
- Gambar akan muncul otomatis
- Tidak perlu restart npm!

---

## 🎯 PRIORITAS GAMBAR

### WAJIB (Must Have):

1. ✅ `ice-cream.png` - Gambar utama 3 ice cream cones

### OPSIONAL (Nice to Have):

2. `strawberry.png` - Dekorasi
3. `mint.png` - Dekorasi
4. `blueberry.png` - Dekorasi
5. `candy-cane.png` - Dekorasi

**Catatan:** Jika hanya punya gambar ice cream, itu sudah cukup! Dekorasi lain bisa ditambahkan nanti.

---

## 🛠️ TOOLS YANG DIREKOMENDASIKAN

### Remove Background:

- **Remove.bg** - https://remove.bg (PALING MUDAH!)
- **Photopea** - https://photopea.com (Gratis, seperti Photoshop)
- **Canva** - https://canva.com (Pro feature)

### Compress/Optimize:

- **TinyPNG** - https://tinypng.com (Compress PNG tanpa loss quality)

### Edit Gambar:

- **Photopea** - https://photopea.com
- **Pixlr** - https://pixlr.com

---

## 📐 CONTOH STRUKTUR FOLDER SETELAH SELESAI

```
D:\Tubes_PTI\ice-cream-79\frontend\src\assets\
├── ice-cream.png      ✅ (WAJIB)
├── strawberry.png     ⭕ (opsional)
├── mint.png           ⭕ (opsional)
├── blueberry.png      ⭕ (opsional)
├── candy-cane.png     ⭕ (opsional)
└── README.md
```

---

## 🚨 TROUBLESHOOTING

### Gambar tidak muncul?

1. ✅ Cek nama file (harus persis: `ice-cream.png` bukan `Ice-Cream.png`)
2. ✅ Cek lokasi folder (harus di `src/assets/`)
3. ✅ Cek extension (.png bukan .jpg)
4. ✅ Refresh browser dengan Ctrl + Shift + R (hard refresh)
5. ✅ Cek console browser (F12) untuk error

### Gambar terlalu besar/kecil?

- File sudah di-code untuk auto-adjust ukuran
- Tapi lebih besar lebih baik (nanti di-resize otomatis)
- Minimal 600px untuk ice cream utama

### Background gambar tidak transparan?

- Gunakan remove.bg untuk remove background otomatis
- Atau edit manual di Photopea

---

## 📞 BANTUAN

Jika masih bingung:

1. Screenshot error di browser console (F12)
2. Cek file ada di folder yang benar
3. Pastikan npm start masih berjalan

---

## ✨ SETELAH GAMBAR DITAMBAHKAN

Tampilan akan otomatis update dengan:

- ✅ Ice cream muncul di atas card
- ✅ Dekorasi muncul di background
- ✅ Tampilan persis seperti design!

**Good luck! 🎉**
