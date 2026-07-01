# CartMate 

CartMate adalah aplikasi mobile berbasis React Native dan Expo yang berfungsi sebagai manajemen daftar belanja (*groceries list*) sekaligus pengelola tugas (*task manager*) belanjaan secara praktis dan modern.

## Fitur Utama
- **Buat & Edit List:** Menambah daftar belanja baru beserta label kategori (opsional).
- **Manajemen Item:** Menambah, mengubah harga, mengatur jumlah (*quantity*), serta menghapus item belanjaan dengan mudah.
- **Kalkulasi Otomatis:** Menghitung subtotal per item dan total keseluruhan belanjaan secara *real-time*.
- **Penyimpanan Lokal:** Data tersimpan aman di dalam perangkat menggunakan database lokal (SQLite).

## Tech Stack
- **Framework:** Expo (React Native) dengan Expo Router (File-based routing)
- **UI Component:** React Native Paper (Material Design)
- **State Management:** React Hooks (`useState`, `useEffect`)
- **Database:** Local Database SQLite

## Cara Menjalankan Project

### 1. Clone Repositori
```bash
git clone [https://github.com/shyfa0911/CartMate_Mobile.git](https://github.com/shyfa0911/CartMate_Mobile.git)
cd CartMate
```

## Install Dependencies
Pastikan kamu sudah menginstal Node.js di laptopmu, lalu jalankan:
```bash
npm install
```

## Jalankan Aplikasi
Mulai server Expo Development:
```bash
npx expo start
```

## Buka di Perangkat
- Android/iOS (Fisik): Scan QR Code yang muncul di terminal menggunakan aplikasi Expo Go (bisa diunduh di Play Store/App Store).
- Emulator: Tekan tombol a pada terminal untuk membuka di Android Emulator, atau i untuk iOS Simulator.
