import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Pastikan env dimuat dari file server/.env jika berjalan secara independen
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config(); // Fallback untuk cwd saat ini

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Peringatan: SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di file .env!');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
