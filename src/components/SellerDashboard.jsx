import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, CheckCircle2, Clock, AlertTriangle, RefreshCw, Edit, Plus, X, Save, FileText, ShoppingBag } from 'lucide-react';

const SellerDashboard = () => {
  // Tabs State: 'orders' | 'catalog'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Catalog State
  const [catalog, setCatalog] = useState([]);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null untuk Tambah Baru, item object untuk Edit
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');

  // Global UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({ id: null, type: '' });
  const navigate = useNavigate();

  // Ambil token dari local storage
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    // Proteksi Rute: Jika token tidak ada, tendang kembali ke /login
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
    fetchCatalog();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Sesi masuk kedaluwarsa. Silakan masuk kembali.');
        }
        throw new Error(resData.message || 'Gagal memuat pesanan.');
      }

      setOrders(resData.data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const response = await fetch('/api/catalog');
      const resData = await response.json();
      if (response.ok) {
        setCatalog(resData.data);
      }
    } catch (err) {
      console.error('Gagal memuat katalog:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  // ========================================================
  // 📋 LOGIKA CRUD PESANAN (ORDERS)
  // ========================================================

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Selesai' : 'Pending';
    setActionLoading({ id, type: 'status' });
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Gagal mengubah status.');

      setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading({ id: null, type: '' });
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen dari database?')) return;
    
    setActionLoading({ id, type: 'delete' });
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Gagal menghapus pesanan.');

      setOrders(orders.filter(o => o.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading({ id: null, type: '' });
    }
  };

  const handleClearAllOrders = async () => {
    setActionLoading({ id: 'all', type: 'clear' });
    try {
      const response = await fetch('/api/orders/all/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Gagal mengosongkan pesanan.');

      setOrders([]);
      setConfirmClearAll(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading({ id: null, type: '' });
    }
  };

  // ========================================================
  // 📖 LOGIKA CRUD KATALOG MENU (CATALOG)
  // ========================================================

  const openAddCatalogModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemPrice('');
    setItemDesc('');
    setShowCatalogModal(true);
  };

  const openEditCatalogModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setItemDesc(item.desc || '');
    setShowCatalogModal(true);
  };

  const handleSaveCatalogItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice.trim()) {
      alert('Nama Menu dan Harga wajib diisi!');
      return;
    }

    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Harga harus berupa angka valid di atas 0!');
      return;
    }

    setLoading(true);
    try {
      const url = editingItem 
        ? `/api/catalog/${editingItem.id}` 
        : '/api/catalog';
      
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: itemName.trim(),
          price: priceNum,
          desc: itemDesc.trim()
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Gagal menyimpan menu katalog.');

      // Refresh katalog data lokal
      await fetchCatalog();
      setShowCatalogModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCatalogItem = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus menu ini dari katalog? Item di dalam pesanan lama yang sudah tercatat tidak akan ikut terhapus.')) return;

    try {
      const response = await fetch(`/api/catalog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Gagal menghapus menu katalog.');

      setCatalog(catalog.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Format Tanggal Bahasa Indonesia
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 p-4 md:p-8 relative overflow-hidden">
      {/* Pattern Komik */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px),
                         repeating-linear-gradient(90deg, transparent, transparent 2px, black 2px, black 4px)`,
        backgroundSize: '30px 30px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Dashboard Brutalist */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-3xl p-6 border-8 border-black shadow-brutal mb-8 gap-4 animate-bounce-in">
          <div>
            <div className="bg-yellow-400 border-4 border-black px-4 py-1 inline-block rotate-1 font-black text-sm mb-2 shadow-md">
              DASHBOARD PENJUAL
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight" style={{ textShadow: '2px 2px 0px #FACC15' }}>
              🍳 KONTROL TOKO LUMER
            </h1>
            <p className="text-lg font-black text-indigo-700 mt-1 flex items-center gap-1">
              Aktif sebagai Admin: <span className="underline text-gray-900">{user.username || 'Owner'}</span> ⚡
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { fetchOrders(); fetchCatalog(); }}
              className="bg-white hover:bg-yellow-300 text-gray-900 font-black p-4 rounded-2xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`stroke-[3] ${loading ? 'animate-spin' : ''}`} size={22} />
              REFRESH DATA
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-4 rounded-2xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-brutal flex items-center gap-2 cursor-pointer hover:rotate-1"
            >
              <LogOut className="stroke-[3]" size={22} />
              LOGOUT
            </button>
          </div>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-500 text-white font-black p-5 rounded-2xl border-8 border-black mb-8 flex items-center gap-3 shadow-brutal animate-bounce-slow">
            <AlertTriangle className="shrink-0" size={32} />
            <div>
              <p className="text-xl">TERJADI MASALAH!</p>
              <p className="text-sm font-bold opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* TABS MENU PILIHAN (PESANAN vs KATALOG) */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 md:flex-initial bg-white font-black px-6 py-4 rounded-2xl border-4 border-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-102 ${
              activeTab === 'orders' ? 'bg-yellow-400 text-gray-900 rotate-1 shadow-brutal border-6' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FileText size={24} />
            DAFTAR PESANAN ({orders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 md:flex-initial bg-white font-black px-6 py-4 rounded-2xl border-4 border-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-102 ${
              activeTab === 'catalog' ? 'bg-pink-400 text-white -rotate-1 shadow-brutal border-6' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <ShoppingBag size={24} />
            KELOLA KATALOG ({catalog.length})
          </button>
        </div>

        {/* ========================================================
            TAB 1: DAFTAR PESANAN (ORDERS)
            ======================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-8 border-black shadow-brutal mb-8 overflow-hidden animate-pop-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-6 border-black pb-6">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                📋 DAFTAR DETAIL PESANAN PELANGGAN
              </h2>
              
              {orders.length > 0 && (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="bg-red-500 hover:bg-red-600 text-white font-black px-5 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer hover:-rotate-2"
                >
                  <Trash2 size={20} />
                  HAPUS SEMUA DATA PESANAN
                </button>
              )}
            </div>

            {loading && orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-2xl font-black text-gray-700">Sedang memuat data pesanan...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-4 border-black border-dashed">
                <div className="text-8xl mb-4">😴</div>
                <p className="text-3xl font-black text-gray-700">BELUM ADA PESANAN MASUK!</p>
                <p className="text-md font-bold text-gray-500 mt-2">Semua pesanan baru pelanggan Anda akan muncul di sini secara real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b-4 border-black bg-gray-100">
                      <th className="p-4 font-black text-gray-900 text-lg">TANGGAL MASUK</th>
                      <th className="p-4 font-black text-gray-900 text-lg">PEMBELI & ALAMAT</th>
                      <th className="p-4 font-black text-gray-900 text-lg">RINCIAN PESANAN</th>
                      <th className="p-4 font-black text-gray-900 text-lg text-right">TOTAL</th>
                      <th className="p-4 font-black text-gray-900 text-lg text-center">STATUS</th>
                      <th className="p-4 font-black text-gray-900 text-lg text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-black">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-all font-bold">
                        {/* Tanggal */}
                        <td className="p-4 text-gray-700 align-top max-w-[200px] break-words">
                          <span className="bg-indigo-100 text-indigo-900 border-2 border-black px-2 py-1 text-xs font-black inline-block rounded mb-1">
                            📅 WAKTU
                          </span>
                          <div className="text-sm font-bold text-gray-900">{formatDate(order.created_at)}</div>
                          <div className="text-xs text-gray-400 font-mono mt-2">ID: {order.id.substring(0,8)}...</div>
                        </td>

                        {/* Pembeli & Alamat */}
                        <td className="p-4 align-top max-w-[250px]">
                          <div className="text-lg font-black text-gray-900 mb-1">👤 {order.buyer_name}</div>
                          <div className="text-sm text-gray-700 bg-gray-100 border-3 border-black p-3 rounded-xl shadow-sm italic leading-relaxed">
                            📍 {order.buyer_address}
                          </div>
                        </td>

                        {/* Rincian Menu */}
                        <td className="p-4 align-top">
                          <div className="space-y-2">
                            {Array.isArray(order.items) && order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm bg-yellow-50 border-2 border-black px-3 py-1.5 rounded-lg shadow-sm">
                                <span className="text-gray-900 font-black">
                                  • {item.name} <span className="text-indigo-600">x{item.qty}</span>
                                </span>
                                <span className="text-gray-500 text-xs">
                                  (Rp {(item.price * item.qty).toLocaleString('id-ID')})
                                </span>
                              </div>
                            ))}
                            <div className="text-xs text-right text-gray-500 font-black">📦 {order.total_items} Items</div>
                          </div>
                        </td>

                        {/* Total Harga */}
                        <td className="p-4 align-top text-right">
                          <div className="bg-red-100 text-red-700 border-3 border-black px-3 py-1.5 inline-block font-black text-lg shadow-sm">
                            Rp {parseFloat(order.total_price).toLocaleString('id-ID')}
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4 align-top text-center">
                          <button
                            onClick={() => toggleStatus(order.id, order.status)}
                            disabled={actionLoading.id === order.id && actionLoading.type === 'status'}
                            className={`px-4 py-2.5 rounded-xl border-3 border-black font-black text-sm tracking-wide shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer transition-all active:scale-95 ${
                              order.status === 'Pending'
                                ? 'bg-yellow-300 hover:bg-yellow-400 text-yellow-950'
                                : 'bg-green-400 hover:bg-green-500 text-green-950'
                            }`}
                          >
                            {actionLoading.id === order.id && actionLoading.type === 'status' ? (
                              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : order.status === 'Pending' ? (
                              <>
                                <Clock size={16} className="stroke-[3]" />
                                PENDING
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={16} className="stroke-[3]" />
                                SELESAI
                              </>
                            )}
                          </button>
                        </td>

                        {/* Aksi Hapus */}
                        <td className="p-4 align-top text-center">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={actionLoading.id === order.id && actionLoading.type === 'delete'}
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl border-3 border-black shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                            title="Hapus Pesanan"
                          >
                            {actionLoading.id === order.id && actionLoading.type === 'delete' ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={18} className="stroke-[3]" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: KELOLA KATALOG MENU (CATALOG CRUD)
            ======================================================== */}
        {activeTab === 'catalog' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border-8 border-black shadow-brutal mb-8 overflow-hidden animate-pop-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-6 border-black pb-6">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                📖 KATALOG DAFTAR MAKANAN
              </h2>
              
              <button
                onClick={openAddCatalogModal}
                className="bg-green-500 hover:bg-green-600 text-white font-black px-5 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer hover:rotate-1"
              >
                <Plus size={20} className="stroke-[3]" />
                TAMBAH MENU BARU
              </button>
            </div>

            {catalog.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 border-4 border-black border-dashed rounded-2xl">
                <p className="text-2xl font-black text-gray-500">😔 Katalog menu masih kosong!</p>
                <p className="text-sm font-bold text-gray-400 mt-1">Gunakan tombol 'TAMBAH MENU BARU' di atas untuk memasukkan menu makanan pertama Anda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b-4 border-black bg-gray-100">
                      <th className="p-4 font-black text-gray-900 text-lg">ID</th>
                      <th className="p-4 font-black text-gray-900 text-lg">NAMA MENU</th>
                      <th className="p-4 font-black text-gray-900 text-lg">DESKRIPSI MENU</th>
                      <th className="p-4 font-black text-gray-900 text-lg text-right">HARGA SATUAN</th>
                      <th className="p-4 font-black text-gray-900 text-lg text-center">AKSI PENGELOLAAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-black">
                    {catalog.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-all font-bold">
                        {/* ID */}
                        <td className="p-4 text-gray-400 font-mono align-middle">
                          #{item.id}
                        </td>

                        {/* Nama Menu */}
                        <td className="p-4 align-middle">
                          <div className="bg-yellow-100 border-2 border-black px-3 py-1 inline-block text-lg font-black text-gray-950 transform -rotate-1 rounded-lg">
                            {item.name}
                          </div>
                        </td>

                        {/* Deskripsi */}
                        <td className="p-4 text-gray-700 align-middle font-bold italic max-w-[300px] break-words">
                          {item.desc || '-'}
                        </td>

                        {/* Harga */}
                        <td className="p-4 align-middle text-right">
                          <div className="bg-indigo-100 text-indigo-900 border-3 border-black px-3 py-1 inline-block font-black text-lg shadow-sm">
                            Rp {parseFloat(item.price).toLocaleString('id-ID')}
                          </div>
                        </td>

                        {/* Aksi Edit & Hapus */}
                        <td className="p-4 align-middle text-center">
                          <div className="flex justify-center gap-3">
                            {/* Tombol Edit */}
                            <button
                              onClick={() => openEditCatalogModal(item)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-3 rounded-xl border-3 border-black shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                              title="Edit Menu"
                            >
                              <Edit size={18} className="stroke-[3]" />
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDeleteCatalogItem(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl border-3 border-black shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                              title="Hapus Menu"
                            >
                              <Trash2 size={18} className="stroke-[3]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL DIALOG: TAMBAH / EDIT KATALOG MENU
          ======================================================== */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border-8 border-black shadow-brutal animate-pop-in relative">
            
            {/* Banner Atas Modal */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-indigo-600 px-6 py-1.5 border-4 border-black shadow-brutal rotate-1 z-20">
              <span className="text-white font-black text-lg tracking-wider uppercase">
                {editingItem ? '📝 EDIT MENU MAKANAN' : '➕ TAMBAH MENU MAKANAN'}
              </span>
            </div>

            {/* Tombol Close */}
            <button
              onClick={() => setShowCatalogModal(false)}
              className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full border-4 border-black shadow-md cursor-pointer transition-all transform hover:scale-110"
            >
              <X size={20} className="stroke-[3]" />
            </button>

            <form onSubmit={handleSaveCatalogItem} className="space-y-5 pt-4">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-1">NAMA MENU MAKANAN</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Contoh: Bakso Super Lumer"
                  className="w-full bg-gray-100 border-4 border-black rounded-xl p-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-1">HARGA SATUAN (RP)</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="Contoh: 15000"
                  className="w-full bg-gray-100 border-4 border-black rounded-xl p-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-1">DESKRIPSI / KETERANGAN MENU</label>
                <textarea
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Contoh: Bakso isi keju mozzarella melimpah!"
                  rows="3"
                  className="w-full bg-gray-100 border-4 border-black rounded-xl p-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-black py-4 rounded-xl border-4 border-black transition-all transform active:scale-95 cursor-pointer shadow-md"
                >
                  BATAL
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl border-4 border-black transition-all transform active:scale-95 cursor-pointer shadow-brutal flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={20} className="stroke-[3]" />
                      SIMPAN MENU
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus Semua Data */}
      {confirmClearAll && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-8 border-black shadow-brutal animate-pop-in text-center">
            <div className="text-6xl mb-4 text-red-500 animate-bounce">⚠️</div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">KONFIRMASI HAPUS DATA</h3>
            <p className="text-gray-600 font-bold mb-6">
              Apakah Anda yakin ingin **menghapus seluruh data pesanan** secara permanen dari database Supabase? Tindakan ini tidak dapat dibatalkan!
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-black py-4 rounded-xl border-4 border-black transition-all transform active:scale-95 cursor-pointer shadow-md"
              >
                BATALKAN
              </button>
              
              <button
                onClick={handleClearAllOrders}
                disabled={actionLoading.id === 'all' && actionLoading.type === 'clear'}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl border-4 border-black transition-all transform active:scale-95 cursor-pointer shadow-brutal flex items-center justify-center gap-2"
              >
                {actionLoading.id === 'all' && actionLoading.type === 'clear' ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Trash2 size={20} />
                    HAPUS SEMUA!
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
