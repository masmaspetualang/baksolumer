import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username dan Password wajib diisi.');
  }

  // 1. Cari user di database
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!users || users.length === 0) {
    throw new Error('Kredensial salah: Akun tidak ditemukan.');
  }

  const user = users[0];

  // 2. Bandingkan password dengan Bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Kredensial salah: Password Anda tidak cocok.');
  }

  // 3. Buat JWT Token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'baksolumer_super_secret_brutalist_key_2026_xoxo',
    { expiresIn: '1d' } // Token berlaku 1 hari
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username
    }
  };
};
