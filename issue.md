Issue #2: Alur Pemesanan Kiosk & Riwayat Keranjang Pelanggan
Latar Belakang & Objektif
Melanjutkan Issue #1, setelah pelanggan memiliki sesi aktif (Sesi ID), mereka harus bisa melihat menu, memasukkan item ke keranjang, dan mengirim pesanan tersebut ke database. Riwayat pesanan yang sudah dikirim harus tetap terlihat di layar HP mereka.

Persyaratan Fitur (Acceptance Criteria)
1. Katalog Menu & Keranjang Pelanggan

Bangun antarmuka UI di /menu/[tableNumber] yang menampilkan daftar menu aktif dari database.

Buat sistem Keranjang Lokal (State Management misal: Zustand) khusus untuk aplikasi pelanggan. Pelanggan bisa menambah/mengurangi kuantitas makanan.

2. Pengiriman Pesanan (Order Submission)

Tambahkan tombol "Kirim Pesanan ke Dapur".

Saat ditekan, sistem harus melakukan INSERT data ke tabel orders (dan order_items).

KRUSIAL: Payload insert harus menyertakan session_id (diambil dari localStorage) dan berstatus awal pending_kitchen.

Setelah berhasil dikirim, kosongkan Keranjang Lokal pelanggan.

3. Riwayat Pesanan Aktif (Order History)

Sediakan tab atau area "Pesanan Saya" di UI pelanggan.

Lakukan fetch (pengambilan data) dari tabel orders yang memiliki session_id milik pelanggan tersebut.

Tampilkan daftar menu apa saja yang sudah mereka pesan dan status masakannya (misal: "Sedang Dimasak", "Selesai"). Ini mencegah pelanggan merasa pesanannya belum masuk.

Catatan Teknis (High-Level)
Pastikan RLS (Row Level Security) di Supabase diatur agar pengguna publik (tanpa login) bisa melakukan INSERT ke tabel orders ASALKAN mereka mengirimkan session_id yang valid dan berstatus active.