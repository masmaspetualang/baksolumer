-- =======================================================
-- SCHEMA DATABASE - BAKSO KEJU LUMER (SUPABASE POSTGRES)
-- =======================================================

-- 1. Hapus Tabel Jika Sudah Ada (Hati-hati: Menghapus data yang ada)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS catalog;
DROP TABLE IF EXISTS users;

-- 2. Buat Tabel Users (Admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Password yang akan di-hash dengan Bcrypt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buat Tabel Katalog (Sederhana - Tanpa emoji, color, comic)
CREATE TABLE catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC NOT NULL,
    "desc" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Buat Tabel Pesanan (Orders)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_name VARCHAR(255) NOT NULL,
    buyer_address TEXT NOT NULL,
    total_price NUMERIC NOT NULL,
    total_items INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Selesai'
    items JSONB NOT NULL, -- Array of items ordered with qty and price
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
