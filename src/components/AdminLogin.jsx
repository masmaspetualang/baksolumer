import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, User, ArrowLeft, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan Password wajib diisi!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Login gagal.');
      }

      // Simpan JWT Token dan Data User
      localStorage.setItem('adminToken', resData.data.token);
      localStorage.setItem('adminUser', JSON.stringify(resData.data.user));

      Swal.fire({
        title: 'LOGIN SUKSES! 🎉',
        text: `Selamat datang, ${resData.data.user.username || 'Admin'}!`,
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'border-8 border-black rounded-3xl bg-white',
          title: 'font-black text-gray-900',
        },
      }).then(() => {
        navigate('/seller');
      });
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
      Swal.fire({
        title: 'LOGIN GAGAL! ❌',
        text: err.message || 'Username atau password salah.',
        icon: 'error',
        confirmButtonText: 'COBA LAGI',
        customClass: {
          popup: 'border-8 border-black rounded-3xl shadow-brutal bg-white',
          title: 'font-black text-gray-900',
          confirmButton: 'bg-red-500 text-white border-4 border-black font-black px-6 py-3 rounded-xl hover:bg-red-600 transition-all'
        },
        buttonsStyling: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Pattern Komik */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px),
                         repeating-linear-gradient(90deg, transparent, transparent 2px, black 2px, black 4px)`,
        backgroundSize: '30px 30px'
      }}></div>

      {/* Button Kembali */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 bg-white hover:bg-yellow-300 text-gray-900 font-black px-5 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-105 shadow-brutal flex items-center gap-2 hover:-rotate-2 z-10 cursor-pointer"
      >
        <ArrowLeft size={20} />
        KEMBALI KE MENU
      </button>

      {/* Box Login Brutalist */}
      <div className="relative w-full max-w-md z-10 mt-12 animate-pop-in">
        {/* Banner Atas */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 px-6 py-2 border-4 border-black shadow-brutal rotate-2 z-20">
          <span className="text-white font-black text-2xl tracking-wider">🔑 PORTAL ADMIN</span>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-8 pt-10 border-8 border-black shadow-brutal">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #FACC15' }}>
              MASUK DASHBOARD
            </h2>
            <p className="text-sm font-bold text-gray-500 italic mt-1">Khusus pemilik Toko Bakso Lumer</p>
          </div>

          {error && (
            <div className="bg-red-500 text-white font-black p-4 rounded-xl border-4 border-black mb-6 flex items-center gap-2 shadow-md animate-bounce-slow">
              <AlertCircle className="shrink-0" size={24} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-1 uppercase">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                  <User size={20} className="stroke-[3]" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Masukkan username admin..."
                  className="w-full bg-gray-100 border-4 border-black rounded-xl pl-10 pr-3 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-1 uppercase">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                  <Key size={20} className="stroke-[3]" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-gray-100 border-4 border-black rounded-xl pl-10 pr-3 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black text-2xl py-4 rounded-2xl transition-all transform active:scale-95 border-6 border-black shadow-brutal flex items-center justify-center gap-3 cursor-pointer ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:-rotate-1'
              }`}
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={26} className="stroke-[3]" />
                  MASUK SEKARANG!
                </>
              )}
            </button>
          </form>

          {/* Hint Akun Default */}
          <div className="bg-yellow-100 rounded-2xl p-4 mt-6 border-4 border-black border-dashed text-center">
            <p className="text-xs font-black text-yellow-800">
              💡 HINT: Gunakan username <span className="underline">admin</span> & password <span className="underline">admin123</span> setelah melakukan seeding database!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
