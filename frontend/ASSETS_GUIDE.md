# Panduan Assets untuk Login Page

## Folder Assets

Letakkan semua gambar Anda di folder: `src/assets/`

## Gambar yang Diperlukan

Anda perlu menyiapkan gambar-gambar berikut dan menempatkannya di folder `src/assets/`:

1. **ice-cream.png** - Gambar 3 ice cream cones (cokelat, strawberry, mint)
2. **strawberry.png** - Gambar strawberry untuk dekorasi
3. **mint.png** - Gambar daun mint untuk dekorasi
4. **blueberry.png** - Gambar blueberry untuk dekorasi
5. **candy-cane.png** - Gambar permen tongkat untuk dekorasi

## Struktur File

```
frontend/
├── src/
│   ├── assets/
│   │   ├── ice-cream.png
│   │   ├── strawberry.png
│   │   ├── mint.png
│   │   ├── blueberry.png
│   │   └── candy-cane.png
│   ├── components/
│   │   ├── Login.js
│   │   └── Login.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
└── package.json
```

## Cara Menjalankan

1. Install dependencies:

   ```bash
   npm install
   ```

2. Jalankan aplikasi:

   ```bash
   npm start
   ```

3. Buka browser di: http://localhost:3000

## Catatan Penting

- Pastikan nama file gambar sesuai dengan yang tercantum di atas
- Format gambar sebaiknya PNG dengan background transparan untuk hasil terbaik
- Ukuran gambar ice cream utama sebaiknya minimal 600x600px untuk kualitas optimal
- Gambar dekorasi (strawberry, mint, dll) ukuran 200x200px sudah cukup
