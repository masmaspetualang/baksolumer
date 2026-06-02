import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/orders (Buat pesanan baru - Publik)
router.post('/', orderController.addOrder);

// GET /api/orders (Ambil semua pesanan - Diproteksi Admin)
router.get('/', requireAdmin, orderController.getOrders);

// PATCH /api/orders/:id (Update status pesanan - Diproteksi Admin)
router.patch('/:id', requireAdmin, orderController.updateOrderStatus);

// DELETE /api/orders/:id (Hapus pesanan individu - Diproteksi Admin)
router.delete('/:id', requireAdmin, orderController.deleteOrder);

// DELETE /api/orders/all/clear (Hapus semua data pesanan - Diproteksi Admin)
router.delete('/all/clear', requireAdmin, orderController.clearAllOrders);

export default router;
