import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

const menuItems = [
  { name: 'Bakso Keju Lumer', price: 15000, desc: 'Kejunya meleleh dimulut!' },
  { name: 'Bakso Keju Kuah', price: 15000, desc: 'Kuah kaldu super mantap!' },
  { name: 'Bakso Biasa', price: 12000, desc: 'Klasik tapi juara!' },
  { name: 'Mie Ayam', price: 12000, desc: 'Mie kenyal ayam juicy!' },
  { name: 'Mie Ayam Bakso', price: 15000, desc: 'Combo super lengkap!' }
];

async function seed() {
  console.log('🏁 Memulai proses seeding database Supabase...');

  try {
    // 1. Seed Katalog Menu
    console.log('🛒 Melakukan seeding tabel "catalog"...');
    // Hapus data lama jika ada
    const { error: deleteCatalogErr } = await supabase.from('catalog').delete().neq('id', 0);
    if (deleteCatalogErr) throw deleteCatalogErr;

    const { data: insertedCatalog, error: catalogErr } = await supabase
      .from('catalog')
      .insert(menuItems)
      .select();

    if (catalogErr) throw catalogErr;
    console.log(`✅ Sukses memasukkan ${insertedCatalog.length} menu katalog!`);

    // 2. Seed Admin User
    console.log('👤 Melakukan seeding tabel "users" (Admin)...');
    
    // Hapus admin lama jika ada
    const { error: deleteUsersErr } = await supabase.from('users').delete().neq('id', 0);
    if (deleteUsersErr) throw deleteUsersErr;

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { data: insertedUser, error: userErr } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          password: hashedPassword
        }
      ])
      .select();

    if (userErr) throw userErr;
    console.log(`✅ Sukses membuat akun Admin default:`);
    console.log(`   - Username: admin`);
    console.log(`   - Password: admin123`);

    console.log('🎉 SEEDING SELESAI DENGAN SUKSES!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat melakukan seeding:', err.message || err);
  }
}

seed();
