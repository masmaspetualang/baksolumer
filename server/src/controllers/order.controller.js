import * as orderService from '../services/order.service.js';

// 1. Tambah Pesanan Baru (Publik)
export const addOrder = async (req, res) => {
  try {
    const newOrder = await orderService.createNewOrder(req.body);
    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil disimpan di database.',
      data: newOrder
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menyimpan pesanan baru.'
    });
  }
};

// 2. Ambil Daftar Pesanan (Admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersList();
    return res.status(200).json({
      success: true,
      message: 'Berhasil memuat semua daftar pesanan.',
      data: orders
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal memuat daftar pesanan.'
    });
  }
};

// 3. Update Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await orderService.updateOrderStatusById(id, status);
    return res.status(200).json({
      success: true,
      message: `Status pesanan berhasil diupdate menjadi '${status}'.`,
      data: updatedOrder
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal memperbarui status pesanan.'
    });
  }
};

// 4. Hapus Pesanan Individu (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await orderService.deleteOrderById(id);
    return res.status(200).json({
      success: true,
      message: 'Pesanan berhasil dihapus.',
      data: deletedOrder
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal menghapus pesanan.'
    });
  }
};

// 5. Hapus Semua Data Pesanan (Admin)
export const clearAllOrders = async (req, res) => {
  try {
    const deletedOrders = await orderService.deleteAllOrdersFromDb();
    return res.status(200).json({
      success: true,
      message: 'Semua data pesanan berhasil dibersihkan dari database.',
      data: deletedOrders
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal membersihkan data pesanan.'
    });
  }
};
