import * as catalogService from '../services/catalog.service.js';

// 1. Dapatkan Katalog
export const getCatalog = async (req, res) => {
  try {
    const catalog = await catalogService.getCatalogList();
    return res.status(200).json({
      success: true,
      message: 'Berhasil memuat katalog makanan.',
      data: catalog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Terjadi kesalahan internal server saat memuat katalog.'
    });
  }
};

// 2. Tambah Menu Baru (Admin)
export const addCatalogItem = async (req, res) => {
  try {
    const newItem = await catalogService.createCatalogItem(req.body);
    return res.status(201).json({
      success: true,
      message: 'Menu baru berhasil ditambahkan ke katalog.',
      data: newItem
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menambahkan menu baru.'
    });
  }
};

// 3. Edit Menu (Admin)
export const editCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await catalogService.updateCatalogItemById(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Menu berhasil diperbarui.',
      data: updatedItem
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal memperbarui menu.'
    });
  }
};

// 4. Hapus Menu (Admin)
export const removeCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await catalogService.deleteCatalogItemById(id);
    return res.status(200).json({
      success: true,
      message: 'Menu berhasil dihapus dari katalog.',
      data: deletedItem
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menghapus menu.'
    });
  }
};

