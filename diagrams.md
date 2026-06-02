# Dokumen Diagram Sistem: Bakso Lumer

Dokumen ini berisi representasi visual berupa **Use Case Diagram** dan **Activity Diagram** untuk sistem aplikasi web **Bakso Lumer**. Diagram di bawah ini dibuat menggunakan format **Mermaid.js** agar dapat dirender secara dinamis dan terlihat sangat modern dan interaktif.

---

## 1. Use Case Diagram

Use Case Diagram menggambarkan interaksi antara pengguna (*Actor*) dengan fitur-fitur yang disediakan oleh sistem aplikasi web Bakso Lumer.

### Aktor Utama:
1. **Pembeli (Buyer):** Pengguna yang menjelajahi menu, mengelola belanjaan, mengisi data pengiriman, dan mengirim pesanan.
2. **Penjual (Seller / Admin WA):** Penerima pesan orderan di WhatsApp yang memproses pembuatan dan pengiriman makanan.

```mermaid
graph LR
    %% Definisi Aktor
    Pembeli((👤 Pembeli))
    Penjual((👨‍🍳 Penjual / Admin))

    subgraph "Sistem Website Bakso Lumer"
        UC1(["📖 Melihat Daftar Menu"])
        UC2(["➕ Menambahkan Menu ke Keranjang"])
        UC3(["🛒 Mengelola Keranjang Belanja<br/>(Ubah Jumlah / Hapus Item)"])
        UC4(["📝 Mengisi Data Pembeli<br/>(Nama & Alamat)"])
        UC5(["💬 Mengirim Pesanan via WhatsApp"])
        UC6(["🍳 Menerima & Memproses Pesanan"])
    end

    %% Hubungan Aktor ke Use Case
    Pembeli --> UC1
    Pembeli --> UC2
    Pembeli --> UC3
    Pembeli --> UC4
    Pembeli --> UC5

    %% Hubungan Dependensi / Include
    UC5 -.-> |"<<include>>"| UC4

    %% Hubungan ke Penjual
    UC5 ===> Penjual
    Penjual --> UC6

    %% Styling
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px;
    classDef usecase fill:#fff,stroke:#000,stroke-width:3px,font-weight:bold;
    class Pembeli,Penjual actor;
    class UC1,UC2,UC3,UC4,UC5,UC6 usecase;
```

---

## 2. Activity Diagram

Activity Diagram ini menggambarkan alur kerja (*workflow*) yang terjadi dari awal pembeli berinteraksi dengan menu hingga berhasil mengirimkan pesanan detail ke WhatsApp penjual.

```mermaid
stateDiagram-v2
    state "Melihat Halaman Menu" as Menu
    state "Menambahkan Menu ke Keranjang" as AddToCart
    state "Membuka Modal Keranjang Belanja" as OpenCart
    state "Mengisi Form Data Pembeli (Nama & Alamat)" as InputForm
    state "Validasi Input Form" as CheckInput
    state "Menampilkan Peringatan Error (Merah)" as ShowError
    state "Memformat Pesanan & Membuka WhatsApp di Tab Baru" as RedirectWA
    state "Mengosongkan Keranjang & Reset Form Input" as ResetCart
    state "Menampilkan Modal Sukses (3 Detik)" as SuccessModal
    
    [*] --> Menu : Mengakses Website
    Menu --> AddToCart : Klik Tombol "BELI!"
    AddToCart --> OpenCart : Klik Tombol Keranjang Melayang
    
    state CekIsiKeranjang <<choice>>
    OpenCart --> CekIsiKeranjang : Klik checkout / keranjang aktif
    
    CekIsiKeranjang --> Menu : [Keranjang Kosong]
    CekIsiKeranjang --> InputForm : [Keranjang Terisi]
    
    InputForm --> CheckInput : Klik Tombol "PESAN VIA WHATSAPP!"
    
    state CekValidasi <<choice>>
    CheckInput --> CekValidasi
    
    CekValidasi --> ShowError : [Nama atau Alamat Kosong]
    ShowError --> InputForm : Perbaiki Inputan
    
    CekValidasi --> RedirectWA : [Data Lengkap & Valid]
    RedirectWA --> ResetCart
    ResetCart --> SuccessModal
    SuccessModal --> Menu : Otomatis Menutup Keranjang setelah 3 detik
    SuccessModal --> [*] : Selesai
```

---

## Penjelasan Alur Sistem

### A. Fungsionalitas Use Case:
* **Melihat Daftar Menu:** Pembeli disajikan tampilan kartu menu bergaya komik yang menarik beserta harga, gambar emoji, dan deskripsi produk.
* **Menambahkan Menu ke Keranjang:** Pembeli dapat menekan tombol `BELI!` untuk menyimpan produk ke keranjang belanja lokal.
* **Mengelola Keranjang:** Memungkinkan pembeli melihat total item, menambah/mengurangi kuantitas secara langsung, serta menghapus item yang tidak jadi dibeli.
* **Mengisi Data Pembeli:** Langkah krusial sebelum melakukan pesanan, di mana nama dan alamat wajib diisi sebagai prasyarat pengiriman.
* **Mengirim Pesanan via WhatsApp:** Sistem mengonversi seluruh isi keranjang dan detail pembeli menjadi pesan terstruktur yang disandikan secara aman ke URL WhatsApp Web/App (`wa.me`).

### B. Alur Aktivitas (Activity):
1. Pengguna membuka halaman utama, memilih menu makanan, dan memasukkannya ke dalam keranjang.
2. Ketika membuka modal keranjang, pengguna wajib mengisi formulir **Nama Lengkap** dan **Alamat Lengkap Pengiriman**.
3. Jika pengguna langsung menekan **PESAN VIA WHATSAPP!** tanpa mengisi formulir, sistem akan menampilkan animasi peringatan merah (validasi gagal).
4. Jika validasi berhasil, sistem menyusun teks detail pesanan dengan format rapi (menggunakan spasi, simbol emoji, dan garis pemisah agar mudah dibaca oleh penjual).
5. Aplikasi membuka tab baru untuk mengarahkan pengguna mengirimkan pesan tersebut langsung ke WhatsApp `+62 813-1113-2611`.
6. Pada saat yang sama, status keranjang belanja dan formulir input dibersihkan secara otomatis, serta menampilkan animasi pop-up sukses hijau selama 3 detik sebelum kembali ke halaman menu utama.
