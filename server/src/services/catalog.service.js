import { supabase } from '../config/supabase.js';

// 1. Ambil Semua Katalog
export const getCatalogList = async () => {
  const { data, error } = await supabase
    .from('catalog')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil data katalog: ${error.message}`);
  }

  return data;
};

// 2. Buat Item Katalog Baru (Admin)
export const createCatalogItem = async (itemData) => {
  const { name, price, desc } = itemData;

  const { data, error } = await supabase
    .from('catalog')
    .insert([{ name, price, desc }])
    .select();

  if (error) {
    throw new Error(`Gagal membuat menu baru: ${error.message}`);
  }

  return data[0];
};

// 3. Edit Item Katalog (Admin)
export const updateCatalogItemById = async (id, itemData) => {
  const { name, price, desc } = itemData;

  const { data, error } = await supabase
    .from('catalog')
    .update({ name, price, desc })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Gagal mengupdate menu: ${error.message}`);
  }

  if (data.length === 0) {
    throw new Error('Menu tidak ditemukan.');
  }

  return data[0];
};

// 4. Hapus Item Katalog (Admin)
export const deleteCatalogItemById = async (id) => {
  const { data, error } = await supabase
    .from('catalog')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Gagal menghapus menu: ${error.message}`);
  }

  if (data.length === 0) {
    throw new Error('Menu tidak ditemukan.');
  }

  return data[0];
};

