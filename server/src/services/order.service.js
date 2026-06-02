import { supabase } from '../config/supabase.js';

// 1. Buat Pesanan Baru
export const createNewOrder = async (orderData) => {
  const { buyerName, buyerAddress, totalPrice, totalItems, items } = orderData;

  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        buyer_name: buyerName,
        buyer_address: buyerAddress,
        total_price: totalPrice,
        total_items: totalItems,
        items: items, // JSONB
        status: 'Pending'
      }
    ])
    .select();

  if (error) {
    throw new Error(`Gagal menyimpan pesanan baru: ${error.message}`);
  }

  return data[0];
};

// 2. Ambil Semua Pesanan (Diurutkan dari terbaru)
export const getAllOrdersList = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil daftar pesanan: ${error.message}`);
  }

  return data;
};

// 3. Update Status Pesanan (Pending / Selesai)
export const updateOrderStatusById = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Gagal mengupdate status pesanan: ${error.message}`);
  }

  if (data.length === 0) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  return data[0];
};

// 4. Hapus Pesanan Spesifik
export const deleteOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Gagal menghapus pesanan: ${error.message}`);
  }

  if (data.length === 0) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  return data[0];
};

// 5. Hapus Semua Data Pesanan
export const deleteAllOrdersFromDb = async () => {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Hapus semua records
    .select();

  if (error) {
    throw new Error(`Gagal mengosongkan data pesanan: ${error.message}`);
  }

  return data;
};
