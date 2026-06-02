import * as authService from '../services/auth.service.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.loginAdmin(username, password);
    return res.status(200).json({
      success: true,
      message: 'Login berhasil! Selamat datang Admin.',
      data: result
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Login gagal. Kredensial tidak valid.'
    });
  }
};
