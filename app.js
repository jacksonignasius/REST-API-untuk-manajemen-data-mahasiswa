require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ----------------------------- Middleware ----------------------------- */
// Batasi origin yang boleh mengakses API (isi CORS_ORIGIN di .env)
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

/* ------------------------------- Routes ------------------------------- */
app.get('/', (req, res) =>
  res.json({ status: 'success', message: 'API Mahasiswa berjalan.', data: null })
);
app.use('/api/mahasiswa', mahasiswaRoutes);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ status: 'error', message: 'Endpoint tidak ditemukan.', data: null })
);

// Error handler global (mis. JSON body yang rusak)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ status: 'error', message: 'Format JSON tidak valid.', data: null });
  }
  console.error(err);
  return res
    .status(500)
    .json({ status: 'error', message: 'Terjadi kesalahan pada server.', data: null });
});

/* ------------------------------- Startup ------------------------------ */
const start = async () => {
  try {
    // Cek koneksi database sebelum server menerima request
    const conn = await pool.getConnection();
    conn.release();
    console.log('Terhubung ke database MySQL.');

    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  } catch (error) {
    console.error('Gagal terhubung ke database:', error.message);
    process.exit(1);
  }
};

start();