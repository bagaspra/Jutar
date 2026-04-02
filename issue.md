Issue #1: Setup Skema Database & Sistem Sesi Pelanggan (QR Kiosk Foundation)
Latar Belakang & Objektif
Kita akan membangun fitur pemesanan mandiri (QR Kiosk) dengan model bayar nanti (post-pay) dan dukungan berbagi meja (shared table/aiseki). Langkah pertama adalah menyiapkan arsitektur database dan sistem "Sesi" agar pelanggan tidak kehilangan keranjang mereka jika browser tidak sengaja tertutup.

Persyaratan Fitur (Acceptance Criteria)
1. Pembaruan Skema Database (Supabase)

Buat tabel baru bernama dining_sessions.

Kolom yang dibutuhkan: id (UUID, berfungsi sebagai token sesi), table_number (String/Int), customer_name (String), status (Enum: active, paid, cancelled), created_at.

Perbarui tabel orders (atau tabel relevan yang menyimpan transaksi) dengan menambahkan foreign key session_id yang merujuk ke dining_sessions(id). Atur relasinya menjadi ON DELETE SET NULL atau CASCADE.

2. Halaman & Logika Pembuatan Sesi (Customer Web App)

Buat routing publik baru: /menu/[tableNumber].

Saat halaman ini diakses, jalankan logika Session Check:

Cek localStorage browser untuk mencari kunci jutar_session_token.

Jika TIDAK ADA token: Tampilkan form "Selamat Datang" yang meminta input Nama Pelanggan. Setelah di-Submit, buat baris baru di tabel dining_sessions (dengan status active), dan simpan UUID yang dihasilkan ke localStorage.

Jika ADA token: Verifikasi ke Supabase apakah sesi tersebut masih active. Jika ya, langsung arahkan pengguna ke halaman Katalog Menu. Jika sudah paid, hapus localStorage dan minta nama ulang.

Catatan Teknis (High-Level)
Gunakan Server Actions atau API Route untuk pembuatan sesi agar aman.

Fokus Issue ini MURNI pada pembuatan Sesi dan pengamanan routing awal. Tampilan katalog menu yang sebenarnya akan dikerjakan di Issue selanjutnya.