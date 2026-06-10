import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, CheckCircle2, Clock, AlertTriangle, RefreshCw, Edit, Plus, X, Save, FileText, ShoppingBag, Printer, Download } from 'lucide-react';
import Swal from 'sweetalert2';

const SellerDashboard = () => {
  // Tabs State: 'orders' | 'catalog'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: nextStatus === 'Selesai' ? '✅ Pesanan ditandai Selesai!' : '🔄 Status dikembalikan ke Pending',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message, confirmButtonText: 'OK', buttonsStyling: true });
    } finally {
      setActionLoading({ id: null, type: '' });
    }
  };

  const handleDeleteOrder = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Pesanan? 🗑️',
      text: 'Pesanan ini akan dihapus permanen dari database. Tindakan tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YA, HAPUS!',
      cancelButtonText: 'BATAL',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });
    if (!result.isConfirmed) return;
    
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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🗑️ Pesanan berhasil dihapus!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message });
    } finally {
      setActionLoading({ id: null, type: '' });
    }
  };

  const handleClearAllOrders = async () => {
    const result = await Swal.fire({
      title: '⚠️ HAPUS SEMUA PESANAN?',
      html: '<b>Seluruh riwayat pesanan</b> akan dihapus permanen dari database.<br/>Tindakan ini <u>tidak bisa dibatalkan</u>!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🗑️ YA, HAPUS SEMUA!',
      cancelButtonText: 'BATAL',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });
    if (!result.isConfirmed) return;

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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🗑️ Semua pesanan berhasil dihapus!',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message });
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
      Swal.fire({ icon: 'warning', title: 'Data Tidak Lengkap!', text: 'Nama Menu dan Harga wajib diisi!', confirmButtonText: 'OK' });
      return;
    }

    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Swal.fire({ icon: 'warning', title: 'Harga Tidak Valid!', text: 'Harga harus berupa angka yang valid dan di atas 0!', confirmButtonText: 'OK' });
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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editingItem ? '✏️ Menu berhasil diperbarui!' : '➕ Menu baru berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan!', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCatalogItem = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Menu Ini? 🗑️',
      text: 'Menu ini akan dihapus dari katalog. Pesanan lama yang sudah tercatat tidak akan terpengaruh.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YA, HAPUS!',
      cancelButtonText: 'BATAL',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });
    if (!result.isConfirmed) return;

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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🗑️ Menu berhasil dihapus dari katalog!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err.message });
    }
  };

  // Helper Ekspor Excel (CSV dengan BOM UTF-8)
  const exportToExcel = () => {
    if (orders.length === 0) return;
    const headers = ["Waktu", "ID Pesanan", "Nama Pembeli", "Alamat", "Item Pesanan", "Total Qty", "Total Harga (Rp)", "Status"];
    const rows = orders.map(o => {
      const itemDetails = o.items.map(item => `${item.name} (x${item.qty})`).join(" | ");
      return [
        formatDate(o.created_at),
        o.id,
        o.buyer_name,
        o.buyer_address.replace(/\n/g, ' '),
        itemDetails,
        o.total_items || o.items.reduce((acc, curr) => acc + (curr.qty || 0), 0),
        o.total_price,
        o.status
      ];
    });
    const csvContent = "\uFEFF" + [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Penjualan_Bakso_Lumer_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Cetak Laporan PDF
  const printReportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal membuka jendela cetak. Pastikan pop-up blocker dinonaktifkan.' });
      return;
    }
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const completedOrders = orders.filter(o => o.status === 'Selesai').length;
    const rowsHtml = orders.map((o, idx) => {
      const itemsHtml = o.items.map(i => `${i.name} (x${i.qty})`).join('<br/>');
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px; font-size: 13px;">${formatDate(o.created_at)}</td>
          <td style="padding: 10px; font-size: 13px;">
            <strong>${o.buyer_name}</strong><br/>
            <span style="font-size: 11px; color: #555;">${o.buyer_address}</span>
          </td>
          <td style="padding: 10px; font-size: 13px;">${itemsHtml}</td>
          <td style="padding: 10px; font-size: 13px; text-align: right;">Rp ${parseFloat(o.total_price).toLocaleString('id-ID')}</td>
          <td style="padding: 10px; font-size: 13px; text-align: center;">
            <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background-color: ${o.status === 'Pending' ? '#fef08a' : '#bbf7d0'}; color: ${o.status === 'Pending' ? '#854d0e' : '#166534'};">
              ${o.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Penjualan - Bakso Lumer</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 30px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 15px; }
            .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; color: #1e293b; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; background-color: #f8fafc; }
            .card .title { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .card .value { font-size: 20px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; padding: 12px 10px; text-align: left; font-size: 13px; font-weight: bold; }
            td { vertical-align: top; padding: 10px; }
            .footer { margin-top: 50px; display: flex; justify-content: justify; font-size: 13px; }
            .footer-date { float: left; }
            .footer-sig { float: right; text-align: center; width: 200px; }
            .clear { clear: both; }
            @media print {
              body { margin: 15px; }
              .card { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Penjualan Bakso Lumer</h1>
            <p>Dicetak pada: ${formatDate(new Date())} | Total Penjualan Aktif</p>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="title">Total Pendapatan</div>
              <div class="value" style="color: #16a34a;">Rp ${totalRevenue.toLocaleString('id-ID')}</div>
            </div>
            <div class="card">
              <div class="title">Total Pesanan</div>
              <div class="value">${orders.length}</div>
            </div>
            <div class="card">
              <div class="title">Pesanan Pending</div>
              <div class="value" style="color: #ca8a04;">${pendingOrders}</div>
            </div>
            <div class="card">
              <div class="title">Pesanan Selesai</div>
              <div class="value" style="color: #2563eb;">${completedOrders}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="width: 15%">Tanggal</th>
                <th style="width: 25%">Pelanggan & Alamat</th>
                <th style="width: 25%">Item</th>
                <th style="width: 15%; text-align: right;">Total Harga</th>
                <th style="width: 15%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div class="footer-date">
              <p>Dicetak oleh: Admin (${user.username || 'Owner'})</p>
            </div>
            <div class="footer-sig">
              <p>Mengetahui,</p>
              <br/><br/><br/>
              <p><strong>Owner Bakso Lumer</strong></p>
            </div>
            <div class="clear"></div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper Cetak Struk Kasir
  const printReceiptPDF = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal membuka jendela cetak. Pastikan pop-up blocker dinonaktifkan.' });
      return;
    }
    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px dashed #ccc;">
        <td style="padding: 6px 0; font-size: 13px;">${item.name}<br/><span style="font-size: 11px; color:#666;">${item.qty} x Rp ${parseFloat(item.price).toLocaleString('id-ID')}</span></td>
        <td style="padding: 6px 0; font-size: 13px; text-align: right; vertical-align: bottom;">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pesanan - ${order.id.substring(0,8)}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              color: #000; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 10px 0;
              box-sizing: border-box;
            }
            .text-center { text-align: center; }
            .header { margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 11px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .details { font-size: 11px; margin-bottom: 10px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; }
            .total-section { margin-top: 10px; font-size: 13px; font-weight: bold; }
            .total-section table tr td { padding: 4px 0; }
            .footer { margin-top: 20px; font-size: 10px; line-height: 1.3; }
            @media print {
              body { width: 100%; padding: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="text-center header">
            <h2>BAKSO LUMER 🔥</h2>
            <p>Rasanya Lumer di Lidah!</p>
            <p>Telp: 0812-XXXX-XXXX</p>
          </div>
          <div class="divider"></div>
          <div class="details">
            <strong>ID:</strong> ${order.id.toUpperCase()}<br/>
            <strong>Waktu:</strong> ${formatDate(order.created_at)}<br/>
            <strong>Pelanggan:</strong> ${order.buyer_name}<br/>
            <strong>Alamat:</strong> ${order.buyer_address}
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; font-size: 11px; padding-bottom: 5px;">Item</th>
                <th style="text-align: right; font-size: 11px; padding-bottom: 5px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total-section">
            <table>
              <tr>
                <td style="font-size: 11px;">Total Items:</td>
                <td style="text-align: right; font-size: 11px;">${order.total_items || order.items.reduce((a,c) => a + c.qty, 0)}</td>
              </tr>
              <tr style="font-size: 15px; border-top: 1px solid #000;">
                <td><strong>GRAND TOTAL:</strong></td>
                <td style="text-align: right;"><strong>Rp ${parseFloat(order.total_price).toLocaleString('id-ID')}</strong></td>
              </tr>
            </table>
          </div>
          <div class="divider"></div>
          <div class="text-center footer">
            <p>Terima kasih atas pesanan Anda!</p>
            <p>Status Pembayaran: ${order.status === 'Selesai' ? 'LUNAS / SELESAI' : 'PENDING'}</p>
            <p>Nikmati sensasi bakso lumer kami!</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
              🍳 halaman pengelola
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
              activeTab === 'catalog' ? 'bg-yellow-400 text-gray-900 rotate-1 shadow-brutal border-6' : 'hover:bg-gray-100 text-gray-700'
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
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b-6 border-black pb-6">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                📋 DAFTAR DETAIL PESANAN PELANGGAN
              </h2>
              
              {orders.length > 0 && (
                <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-start xl:justify-end">
                  <button
                    onClick={exportToExcel}
                    className="bg-green-500 hover:bg-green-600 text-white font-black px-4 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer hover:rotate-1"
                  >
                    <Download size={18} className="stroke-[3]" />
                    EXPORT EXCEL
                  </button>
                  <button
                    onClick={printReportPDF}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-black px-4 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer hover:-rotate-1"
                  >
                    <Printer size={18} className="stroke-[3]" />
                    CETAK LAPORAN PDF
                  </button>
                  <button
                    onClick={handleClearAllOrders}
                    className="bg-red-500 hover:bg-red-600 text-white font-black px-4 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer hover:rotate-1"
                  >
                    <Trash2 size={18} />
                    HAPUS SEMUA PESANAN
                  </button>
                </div>
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

                        {/* Aksi Struk & Hapus */}
                        <td className="p-4 align-top text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-xl border-3 border-black shadow-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                              title="Cetak Struk Pesanan"
                            >
                              <Printer size={18} className="stroke-[3]" />
                            </button>
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

      {/* ========================================================
          MODAL DIALOG: STRUK PESANAN (RECEIPT DETAILED)
          ======================================================== */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-8 border-black shadow-brutal animate-pop-in relative">
            
            {/* Banner Atas Modal */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 px-6 py-1.5 border-4 border-black shadow-brutal rotate-1 z-20">
              <span className="text-gray-900 font-black text-lg tracking-wider uppercase">
                📄 STRUK PESANAN PELANGGAN
              </span>
            </div>

            {/* Tombol Close */}
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full border-4 border-black shadow-md cursor-pointer transition-all transform hover:scale-110"
            >
              <X size={20} className="stroke-[3]" />
            </button>

            {/* Kertas Struk / Thermal Mockup */}
            <div className="bg-gray-50 border-4 border-black p-5 rounded-2xl shadow-inner font-mono text-sm text-gray-950 mt-4 max-h-[60vh] overflow-y-auto">
              <div className="text-center mb-4">
                <h3 className="text-xl font-black tracking-widest uppercase">BAKSO LUMER 🔥</h3>
                <p className="text-xs text-gray-600 mt-1">Kuliner Bakso Lumer Terenak</p>
                <p className="text-xs text-gray-500">Telp: 0812-XXXX-XXXX</p>
                <div className="border-b-2 border-dashed border-black my-3"></div>
              </div>

              <div className="space-y-1 text-xs mb-3">
                <div><strong>ID ORDER :</strong> {selectedReceiptOrder.id.toUpperCase()}</div>
                <div><strong>TANGGAL  :</strong> {formatDate(selectedReceiptOrder.created_at)}</div>
                <div><strong>PEMBELI  :</strong> {selectedReceiptOrder.buyer_name}</div>
                <div className="whitespace-pre-wrap"><strong>ALAMAT   :</strong> {selectedReceiptOrder.buyer_address}</div>
              </div>

              <div className="border-b-2 border-dashed border-black my-3"></div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-1 font-bold">MENU ITEM</th>
                    <th className="text-right py-1 font-bold">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-300">
                  {selectedReceiptOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2">
                        <span className="font-bold">{item.name}</span>
                        <div className="text-gray-500 text-[10px]">{item.qty} x Rp {parseFloat(item.price).toLocaleString('id-ID')}</div>
                      </td>
                      <td className="text-right py-2 align-bottom">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b-2 border-dashed border-black my-3"></div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total Qty:</span>
                  <span>{selectedReceiptOrder.total_items || selectedReceiptOrder.items.reduce((acc, curr) => acc + curr.qty, 0)} Items</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-black pt-2">
                  <span>GRAND TOTAL:</span>
                  <span>Rp {parseFloat(selectedReceiptOrder.total_price).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="border-b-2 border-dashed border-black my-3"></div>

              <div className="text-center text-[10px] text-gray-500 space-y-1">
                <p className="font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                <p>Status: {selectedReceiptOrder.status === 'Selesai' ? 'LUNAS / SELESAI' : 'PENDING'}</p>
                <p className="italic">"Lumer di mulut, nyaman di dompet!"</p>
              </div>
            </div>

            {/* Tombol Cetak / Tutup */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-black py-3 rounded-xl border-4 border-black transition-all transform active:scale-95 cursor-pointer shadow-md text-center"
              >
                TUTUP
              </button>
              
              <button
                type="button"
                onClick={() => printReceiptPDF(selectedReceiptOrder)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3 rounded-xl border-4 border-black transition-all transform active:scale-95 cursor-pointer shadow-brutal flex items-center justify-center gap-2"
              >
                <Printer size={18} className="stroke-[3]" />
                CETAK STRUK
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;
