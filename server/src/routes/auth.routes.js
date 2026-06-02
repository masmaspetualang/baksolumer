import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/auth/login (Login Admin)
router.post('/login', authController.login);

export default router;
