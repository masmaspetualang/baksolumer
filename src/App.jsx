import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, Check, Zap, Star, Send, ShieldAlert, Award } from 'lucide-react';

// Import Admin Components
import AdminLogin from './components/AdminLogin';
import SellerDashboard from './components/SellerDashboard';

// ========================================================
// 🎭 DYNAMIC STYLE MAPPER FOR CATALOG (PRESERVING AESTHETICS)
// ========================================================
const itemStylingPreset = {
  'bakso keju lumer': { emoji: '🧀', color: 'from-yellow-400 to-orange-500', comic: 'POW!' },
  'bakso keju kuah': { emoji: '🍜', color: 'from-blue-400 to-cyan-500', comic: 'SLURP!' },
  'bakso biasa': { emoji: '🍲', color: 'from-red-400 to-pink-500', comic: 'BOOM!' },
  'mie ayam': { emoji: '🍝', color: 'from-green-400 to-emerald-500', comic: 'YUM!' },
  'mie ayam bakso': { emoji: '🍜', color: 'from-purple-400 to-pink-500', comic: 'WOW!' }
};

const getStyling = (name, index) => {
  const key = name.toLowerCase().trim();
  if (itemStylingPreset[key]) return itemStylingPreset[key];

  // Fallbacks jika nama item berbeda di database
  const fallbackColors = [
    'from-yellow-400 to-orange-500',
    'from-blue-400 to-cyan-500',
    'from-red-400 to-pink-500',
    'from-green-400 to-emerald-500',
    'from-purple-400 to-pink-500'
  ];
  const fallbackEmojis = ['🍜', '🍲', '🍝', '🧀', '🍔'];
  const fallbackComics = ['POW!', 'BAM!', 'BOOM!', 'YUM!', 'WOW!'];

  return {
    emoji: fallbackEmojis[index % fallbackEmojis.length],
    color: fallbackColors[index % fallbackColors.length],
    comic: fallbackComics[index % fallbackComics.length]
  };
};

// ========================================================
// 🛒 CUSTOMER HOME STOREFRONT VIEW
// ========================================================
const Storefront = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [comicBursts, setComicBursts] = useState([]);
  const [stars, setStars] = useState([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  useEffect(() => {
    // Ambil data menu secara dinamis dari API backend
    fetchCatalog();

    // Efek komik mengapung
    const bursts = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      text: ['POW!', 'BAM!', 'ZAP!', 'BOOM!', 'WOW!'][Math.floor(Math.random() * 5)]
    }));
    setComicBursts(bursts);

    const newStars = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      size: 20 + Math.random() * 20
    }));
    setStars(newStars);
  }, []);

  const fetchCatalog = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch('/api/catalog');
      const resData = await response.json();
      if (response.ok) {
        setMenuItems(resData.data);
      } else {
        console.error('Gagal memuat katalog:', resData.message);
      }
    } catch (err) {
      console.error('Terjadi kesalahan koneksi saat memuat katalog:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = c.qty + change;
        return newQty > 0 ? { ...c, qty: newQty } : c;
      }
      return c;
    }).filter(c => c.qty > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  };

  const handleCheckout = async () => {
    if (!buyerName.trim() || !buyerAddress.trim()) {
      setValidationError('Nama dan Alamat Lengkap wajib diisi!');
      return;
    }
    setValidationError('');
    setOrderSubmitting(true);

    try {
      // 1. Simpan Pesanan ke Database Supabase melalui backend API
      const orderPayload = {
        buyerName: buyerName.trim(),
        buyerAddress: buyerAddress.trim(),
        totalPrice: getTotalPrice(),
        totalItems: getTotalItems(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          qty: item.qty
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Gagal menyimpan data pesanan ke database.');
      }

      // 2. Format Pesanan Terperinci untuk WhatsApp
      const formattedTotalPrice = getTotalPrice().toLocaleString('id-ID');
      let orderDetails = `*🔥 PESANAN BARU - BAKSO KEJU LUMER 🔥*\n\n`;
      orderDetails += `*Data Pembeli:*\n`;
      orderDetails += `👤 *Nama:* ${buyerName.trim()}\n`;
      orderDetails += `📍 *Alamat:* ${buyerAddress.trim()}\n\n`;
      orderDetails += `*Detail Item:*\n`;
      orderDetails += `----------------------------------------\n`;
      
      cart.forEach(item => {
        const itemSubtotal = (parseFloat(item.price) * item.qty).toLocaleString('id-ID');
        orderDetails += `• *${item.name}*\n`;
        orderDetails += `  Qty: ${item.qty}x\n`;
        orderDetails += `  Harga: Rp ${parseFloat(item.price).toLocaleString('id-ID')}\n`;
        orderDetails += `  Subtotal: Rp ${itemSubtotal}\n\n`;
      });
      
      orderDetails += `----------------------------------------\n`;
      orderDetails += `📦 *Total Item:* ${getTotalItems()}\n`;
      orderDetails += `💰 *TOTAL BAYAR:* *Rp ${formattedTotalPrice}*\n\n`;
      orderDetails += `Mohon segera diproses ya, terima kasih! 🙏`;

      const encodedText = encodeURIComponent(orderDetails);
      const whatsappUrl = `https://wa.me/6281311132611?text=${encodedText}`;

      // Buka WA di tab baru
      window.open(whatsappUrl, '_blank');

      // Tampilkan notifikasi sukses
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        setBuyerName('');
        setBuyerAddress('');
        setShowCart(false);
      }, 3000);

    } catch (err) {
      alert(`⚠️ Maaf, terjadi kesalahan: ${err.message || 'Gagal memproses pesanan.'}`);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 overflow-hidden relative">
      {/* Comic Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px),
                         repeating-linear-gradient(90deg, transparent, transparent 2px, black 2px, black 4px)`,
        backgroundSize: '30px 30px'
      }}></div>

      {/* Floating Stars */}
      {stars.map(star => (
        <div
          key={`star-${star.id}`}
          className="absolute pointer-events-none animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            fontSize: `${star.size}px`
          }}
        >
          ⭐
        </div>
      ))}

      {/* Comic Burst Effects */}
      {comicBursts.map(burst => (
        <div
          key={`burst-${burst.id}`}
          className="absolute font-black text-white pointer-events-none animate-comic-pop"
          style={{
            left: `${burst.left}%`,
            top: `${burst.top}%`,
            animationDelay: `${burst.delay}s`,
            fontSize: '2rem',
            textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            transform: 'rotate(-15deg)'
          }}
        >
          {burst.text}
        </div>
      ))}

      {/* Admin Quick Entry Button (Protected Portal) */}
      <div className="absolute top-4 right-4 z-30">
        <Link
          to="/login"
          className="bg-white hover:bg-yellow-300 text-gray-900 font-black px-4 py-2 border-4 border-black rounded-xl shadow-brutal text-sm flex items-center gap-1.5 transition-all transform hover:scale-105"
        >
          <ShieldAlert size={16} />
          ADMIN PORTAL
        </Link>
      </div>

      {/* Action Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-full h-1 bg-white opacity-20 animate-speed-line" style={{ transform: 'translateX(-50%) rotate(5deg)' }}></div>
        <div className="absolute top-1/3 left-1/2 w-full h-1 bg-white opacity-20 animate-speed-line" style={{ transform: 'translateX(-50%) rotate(-5deg)', animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/3 left-1/2 w-full h-1 bg-white opacity-20 animate-speed-line" style={{ transform: 'translateX(-50%) rotate(3deg)', animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Comic Header */}
        <div className="text-center mb-12 animate-bounce-in">
          {/* Speech Bubble */}
          <div className="inline-block relative mb-8">
            <div className="bg-white rounded-3xl px-8 py-4 border-8 border-black shadow-brutal transform -rotate-2 relative">
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"></div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[24px] border-r-[24px] border-t-[24px] border-l-transparent border-r-transparent border-t-black"></div>
              <p className="text-3xl font-black text-red-600">🔥 PROMO SPESIAL! 🔥</p>
            </div>
          </div>

          {/* Main Title */}
          <div className="relative inline-block mb-4">
            <h1 className="text-7xl md:text-9xl font-black text-white transform -rotate-3 relative z-10 animate-wiggle"
                style={{
                  textShadow: '6px 6px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0 0 20px rgba(255,255,0,0.5)'
                }}>
              BAKSO
            </h1>
            <div className="absolute -inset-4 bg-yellow-400 transform rotate-2 -z-10 border-4 border-black"></div>
          </div>

          <div className="relative inline-block">
            <h2 className="text-6xl md:text-8xl font-black text-white transform rotate-2 relative z-10"
                style={{
                  textShadow: '5px 5px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                }}>
              KEJU LUMER!
            </h2>
            <div className="absolute -inset-4 bg-pink-500 transform -rotate-1 -z-10 border-4 border-black"></div>
          </div>

          {/* Hero Showcase */}
          <div className="flex justify-center items-center gap-8 my-12 flex-wrap">
            {/* Main Dish Comic Panel */}
            <div className="relative group">
              <div className="bg-white w-64 h-64 rounded-2xl border-8 border-black shadow-brutal transform hover:rotate-3 transition-all overflow-hidden">
                <div className="absolute top-2 left-2 bg-red-600 text-white px-4 py-1 font-black border-4 border-black transform -rotate-6 z-10">
                  NEW!
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
                  <div className="text-9xl animate-float-comic">🧀</div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white border-4 border-black px-4 py-2 font-black text-lg text-center transform -rotate-1">
                    SUPER CHEESY!
                  </div>
                </div>
              </div>
              {/* Action burst */}
              <div className="absolute -top-8 -right-8 text-5xl font-black text-yellow-400 animate-spin-slow"
                   style={{ textShadow: '3px 3px 0px #000' }}>
                💥
              </div>
            </div>

            {/* Price Burst */}
            <div className="relative">
              <div className="bg-red-600 w-48 h-48 rounded-full border-8 border-black shadow-brutal flex items-center justify-center transform hover:scale-110 transition-all animate-pulse-comic">
                <div className="text-center">
                  <p className="text-white font-black text-2xl mb-2">CUMA</p>
                  <p className="text-white text-6xl font-black">15K</p>
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-yellow-400 animate-spin-slow"></div>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 text-4xl animate-bounce">⚡</div>
              <div className="absolute -bottom-4 -right-4 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Zap className="text-yellow-400 animate-bounce" size={40} />
            <Star className="text-pink-400 animate-spin-slow" size={40} />
            <Zap className="text-cyan-400 animate-bounce" size={40} style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Menu Comic Panels */}
        <div className="bg-white rounded-3xl p-8 shadow-brutal mb-8 animate-slide-in border-8 border-black relative">
          {/* Comic book style header */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-pink-600 px-8 py-3 border-6 border-black shadow-brutal rotate-1 z-10">
            <h3 className="text-4xl font-black text-white drop-shadow-lg flex items-center gap-2">
              📖 KATALOG MENU LUMER!
            </h3>
          </div>

          {loadingMenu ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-lg font-black text-gray-600">Sedang mengambil menu dari database...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border-4 border-black border-dashed rounded-2xl">
              <p className="text-2xl font-black text-gray-500">😔 Katalog Kosong!</p>
              <p className="text-sm font-bold text-gray-400 mt-1">Harap jalankan seeder database terlebih dahulu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {menuItems.map((item, index) => {
                // Ambil preset styling komik secara dinamis berdasarkan nama
                const style = getStyling(item.name, index);
                return (
                  <div key={item.id} className="relative group animate-pop-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`bg-gradient-to-br ${style.color} rounded-2xl p-6 border-6 border-black shadow-brutal transform hover:-rotate-2 hover:scale-105 transition-all relative overflow-hidden`}>
                      <div className="absolute -top-3 -right-3 bg-yellow-400 border-4 border-black rounded-full w-16 h-16 flex items-center justify-center font-black text-sm transform rotate-12 shadow-lg z-10">
                        {style.comic}
                      </div>

                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
                        backgroundSize: '10px 10px'
                      }}></div>

                      <div className="relative z-10">
                        <div className="text-7xl mb-4 animate-wiggle-slow">{style.emoji}</div>
                        
                        <div className="bg-white rounded-xl px-4 py-2 border-4 border-black mb-3 relative">
                          <h4 className="text-xl font-black text-gray-900">{item.name}</h4>
                          <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-white"></div>
                          <div className="absolute -bottom-3 left-7 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-black"></div>
                        </div>

                        <p className="text-white font-bold text-sm mb-4 italic drop-shadow-md">{item.desc || 'Nikmat lumer tiada tara!'}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="bg-yellow-400 border-4 border-black px-4 py-2 transform -rotate-3 shadow-md">
                            <span className="text-2xl font-black text-gray-900">
                              {parseFloat(item.price).toLocaleString('id-ID')}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-white hover:bg-yellow-300 text-gray-900 font-black px-6 py-3 rounded-xl border-4 border-black transition-all transform hover:scale-110 shadow-lg flex items-center gap-2 hover:rotate-3 cursor-pointer"
                          >
                            <Plus size={20} />
                            BELI!
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black px-8 py-4 rounded-full border-6 border-black shadow-brutal transform hover:scale-110 hover:rotate-6 transition-all flex items-center gap-3 z-50 animate-bounce-slow cursor-pointer"
          >
            <ShoppingCart size={28} />
            <span className="text-2xl font-black">{getTotalItems()}</span>
            <div className="absolute -top-2 -right-2 bg-red-600 border-3 border-black rounded-full w-8 h-8 flex items-center justify-center text-sm animate-ping">
              !
            </div>
          </button>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-8 border-black shadow-brutal animate-pop-in">
              <div className="flex justify-between items-center mb-6">
                <div className="relative">
                  <h3 className="text-5xl font-black text-white flex items-center gap-3"
                      style={{ textShadow: '4px 4px 0px #000' }}>
                    🛒 KERANJANG
                  </h3>
                  <div className="absolute -bottom-2 left-0 right-0 h-2 bg-yellow-400 border-2 border-black"></div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full border-4 border-black transition-all transform hover:scale-110 hover:rotate-90 shadow-lg cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-4">😢</div>
                  <p className="text-white text-2xl font-black">KOSONG NIH!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="bg-white rounded-2xl p-6 border-6 border-black shadow-brutal transform hover:-rotate-1 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-2xl font-black text-gray-900 mb-1">{item.name}</h4>
                            <div className="bg-yellow-400 inline-block px-3 py-1 border-3 border-black transform -rotate-2">
                              <p className="text-gray-900 text-lg font-black">
                                Rp {parseFloat(item.price).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full border-3 border-black transition-all transform hover:scale-110 hover:rotate-180 shadow-md cursor-pointer"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 bg-gray-100 rounded-full p-2 border-4 border-black">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 font-black border-3 border-black shadow-md cursor-pointer"
                            >
                              <Minus size={20} />
                            </button>
                            <span className="text-3xl font-black text-gray-900 w-12 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 font-black border-3 border-black shadow-md cursor-pointer"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                          <div className="bg-pink-400 px-4 py-2 border-4 border-black transform rotate-2 shadow-md">
                            <span className="text-2xl font-black text-white drop-shadow-md">
                              Rp {(parseFloat(item.price) * item.qty).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form Data Pembeli */}
                  <div className="bg-white rounded-2xl p-6 mb-6 border-6 border-black shadow-brutal">
                    <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2" style={{ textShadow: '1px 1px 0px #000' }}>
                      📝 DATA PEMBELI
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">NAMA LENGKAP</label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={(e) => {
                            setBuyerName(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          placeholder="Masukkan nama Anda..."
                          className="w-full bg-gray-100 border-4 border-black rounded-xl p-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">ALAMAT LENGKAP PENGIRIMAN</label>
                        <textarea
                          value={buyerAddress}
                          onChange={(e) => {
                            setBuyerAddress(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          placeholder="Masukkan alamat pengiriman lengkap..."
                          rows="3"
                          className="w-full bg-gray-100 border-4 border-black rounded-xl p-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {validationError && (
                    <div className="bg-red-500 text-white font-black p-4 rounded-xl border-4 border-black mb-6 text-center animate-pulse">
                      ⚠️ {validationError}
                    </div>
                  )}

                  <div className="bg-yellow-400 rounded-2xl p-6 mb-6 border-6 border-black shadow-brutal">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-black text-gray-900">Total Item:</span>
                      <span className="text-4xl font-black text-gray-900">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between items-center border-t-4 border-black pt-4">
                      <span className="text-3xl font-black text-gray-900">TOTAL:</span>
                      <span className="text-5xl font-black text-red-600">
                        Rp {getTotalPrice().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={orderSubmitting}
                    className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-3xl py-6 rounded-2xl transition-all transform border-6 border-black shadow-brutal flex items-center justify-center gap-3 cursor-pointer ${
                      orderSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {orderSubmitting ? (
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={32} />
                        PESAN VIA WHATSAPP!
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-12 text-center border-8 border-black shadow-brutal animate-pop-in relative">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-6xl font-black text-yellow-400 animate-bounce"
                   style={{ textShadow: '4px 4px 0px #000' }}>
                BERHASIL!
              </div>
              <div className="text-9xl mb-6 animate-wiggle">✅</div>
              <div className="bg-white rounded-2xl p-6 border-6 border-black mb-4">
                <h3 className="text-4xl font-black text-gray-900 mb-2">PESANAN DIBUAT!</h3>
                <p className="text-2xl font-bold text-gray-700">Membuka WhatsApp... 🎉</p>
              </div>
              <p className="text-xl font-black text-white drop-shadow-lg">Silakan kirim pesan WhatsApp yang muncul.</p>
              
              <div className="absolute top-4 left-4 text-4xl animate-spin-slow">⭐</div>
              <div className="absolute top-4 right-4 text-4xl animate-spin-slow" style={{ animationDelay: '0.5s' }}>⭐</div>
              <div className="absolute bottom-4 left-8 text-4xl animate-bounce">🎊</div>
              <div className="absolute bottom-4 right-8 text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎉</div>
            </div>
          </div>
        )}

        {/* Footer Comic Strip */}
        <div className="text-center mt-12 animate-slide-in">
          <div className="inline-block bg-white rounded-3xl px-12 py-6 border-8 border-black shadow-brutal transform hover:rotate-2 transition-all">
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2 flex items-center justify-center gap-1">
              🌶️ PEDAS! NIKMAT! LUMER! 🧀
            </p>
            <p className="text-xl font-bold text-gray-700">Pesan sekarang juga! Dijamin NAGIH!</p>
          </div>
        </div>
      </div>

    </div>
  );
};

// ========================================================
// 🛣️ MAIN NAVIGATION ROUTER ROUTING SYSTEM
// ========================================================
const BaksoWebsite = () => {
  return (
    <>
      <Routes>
        {/* Rute Depan: Toko/Storefront Pembeli */}
        <Route path="/" element={<Storefront />} />
        
        {/* Rute Login Admin */}
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Rute Dashboard Seller Penjual */}
        <Route path="/seller" element={<SellerDashboard />} />
      </Routes>
      
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes comic-pop {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(-15deg); }
        }
        @keyframes speed-line {
          0% { transform: translateX(-200%) scaleX(0); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateX(100%) scaleX(2); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes wiggle-slow {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes float-comic {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-comic {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8) rotate(-5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes slide-in {
          0% { opacity: 0; transform: translateY(50px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-comic-pop { animation: comic-pop 4s ease-in-out infinite; }
        .animate-speed-line { animation: speed-line 2s ease-in-out infinite; }
        .animate-bounce-in { animation: bounce-in 0.8s ease-out; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .animate-wiggle-slow { animation: wiggle-slow 2s ease-in-out infinite; }
        .animate-float-comic { animation: float-comic 3s ease-in-out infinite; }
        .animate-pulse-comic { animation: pulse-comic 2s ease-in-out infinite; }
        .animate-pop-in { animation: pop-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        
        .shadow-brutal {
          box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
        }
        .border-6 {
          border-width: 6px;
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </>
  );
};

export default BaksoWebsite;