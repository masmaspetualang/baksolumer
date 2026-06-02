import express from 'express';
import * as catalogController from '../controllers/catalog.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/catalog (Mendapatkan semua item menu - Publik)
router.get('/', catalogController.getCatalog);

// POST /api/catalog (Tambah menu baru - Diproteksi Admin)
router.post('/', requireAdmin, catalogController.addCatalogItem);

// PATCH /api/catalog/:id (Edit menu - Diproteksi Admin)
router.patch('/:id', requireAdmin, catalogController.editCatalogItem);

// DELETE /api/catalog/:id (Hapus menu - Diproteksi Admin)
router.delete('/:id', requireAdmin, catalogController.removeCatalogItem);

export default router;

