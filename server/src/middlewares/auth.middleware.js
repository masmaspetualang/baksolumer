import jwt from 'jsonwebtoken';

export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Token otorisasi tidak ditemukan.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'baksolumer_super_secret_brutalist_key_2026_xoxo');
    
    req.user = decoded; // Menyimpan data admin terverifikasi di request object
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Token tidak valid atau kedaluwarsa.',
      error: err.message
    });
  }
};
