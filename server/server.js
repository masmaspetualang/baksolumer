import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import Routes
import catalogRoutes from './src/routes/catalog.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import authRoutes from './src/routes/auth.routes.js';

// Konfigurasi Environment Variables dari server/.env
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Middleware
app.use('/api/catalog', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Base Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API Bakso Lumer berjalan dengan sukses!'
  });
});

// Penanganan Rute Tidak Ditemukan
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API Endpoint tidak ditemukan.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: err.message
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server Express aktif di http://localhost:${PORT}`);
  });
}

export default app;
