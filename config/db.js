const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool: koneksi dipakai ulang sehingga lebih efisien dibanding
// membuat koneksi baru di setiap request.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Kolom DATE dikembalikan sebagai string 'YYYY-MM-DD' agar tidak
  // bergeser akibat konversi zona waktu pada objek Date JavaScript.
  dateStrings: true,
});

module.exports = pool;