const pool = require('../config/db');

/* ----------------------------- Helper ----------------------------- */

// Format respons JSON yang konsisten
const sendResponse = (res, httpCode, message, data = null) =>
  res.status(httpCode).json({
    status: httpCode < 400 ? 'success' : 'error',
    message,
    data,
  });

// Validasi format tanggal YYYY-MM-DD dan memastikan tanggalnya valid
const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

// Validasi & normalisasi input. Mengembalikan { errors, values }.
const validateInput = (body, { requireNim }) => {
  const errors = [];
  const nim = typeof body.nim === 'string' ? body.nim.trim() : '';
  const nama = typeof body.nama === 'string' ? body.nama.trim() : '';
  const alamat = typeof body.alamat === 'string' ? body.alamat.trim() : '';
  const tglLahir = typeof body.tgl_lahir === 'string' ? body.tgl_lahir.trim() : '';
  const jurusan = typeof body.jurusan === 'string' ? body.jurusan.trim() : '';

  if (requireNim) {
    if (!nim) errors.push('NIM wajib diisi.');
    else if (nim.length > 20) errors.push('NIM maksimal 20 karakter.');
  }
  if (!nama) errors.push('Nama wajib diisi.');
  else if (nama.length > 100) errors.push('Nama maksimal 100 karakter.');
  if (tglLahir && !isValidDate(tglLahir)) {
    errors.push('Tanggal lahir harus berformat YYYY-MM-DD dan valid.');
  }
  if (jurusan.length > 100) errors.push('Jurusan maksimal 100 karakter.');

  return {
    errors,
    // String kosong disimpan sebagai NULL
    values: {
      nim,
      nama,
      alamat: alamat || null,
      tgl_lahir: tglLahir || null,
      jurusan: jurusan || null,
    },
  };
};

/* ---------------------------- Controllers ---------------------------- */

// GET /api/mahasiswa
exports.getAllMahasiswa = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mahasiswa ORDER BY nim ASC');
    return sendResponse(res, 200, 'Data mahasiswa berhasil diambil.', rows);
  } catch (error) {
    console.error('[getAllMahasiswa]', error);
    return sendResponse(res, 500, 'Terjadi kesalahan pada server.');
  }
};

// GET /api/mahasiswa/:nim
exports.getMahasiswaByNim = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM mahasiswa WHERE nim = ?', [
      req.params.nim,
    ]);
    if (rows.length === 0) {
      return sendResponse(res, 404, 'Mahasiswa tidak ditemukan.');
    }
    return sendResponse(res, 200, 'Detail mahasiswa berhasil diambil.', rows[0]);
  } catch (error) {
    console.error('[getMahasiswaByNim]', error);
    return sendResponse(res, 500, 'Terjadi kesalahan pada server.');
  }
};

// POST /api/mahasiswa
exports.createMahasiswa = async (req, res) => {
  const { errors, values } = validateInput(req.body, { requireNim: true });
  if (errors.length > 0) {
    return sendResponse(res, 400, errors.join(' '));
  }

  try {
    // Prepared statement mencegah SQL Injection
    await pool.execute(
      `INSERT INTO mahasiswa (nim, nama, alamat, tgl_lahir, jurusan)
       VALUES (?, ?, ?, ?, ?)`,
      [values.nim, values.nama, values.alamat, values.tgl_lahir, values.jurusan]
    );
    return sendResponse(res, 201, 'Mahasiswa berhasil ditambahkan.', values);
  } catch (error) {
    // Primary key duplikat
    if (error.code === 'ER_DUP_ENTRY') {
      return sendResponse(res, 409, `NIM ${values.nim} sudah terdaftar.`);
    }
    console.error('[createMahasiswa]', error);
    return sendResponse(res, 500, 'Terjadi kesalahan pada server.');
  }
};

// PUT /api/mahasiswa/:nim
exports.updateMahasiswa = async (req, res) => {
  const { nim } = req.params;
  const { errors, values } = validateInput(req.body, { requireNim: false });
  if (errors.length > 0) {
    return sendResponse(res, 400, errors.join(' '));
  }

  try {
    const [result] = await pool.execute(
      `UPDATE mahasiswa
          SET nama = ?, alamat = ?, tgl_lahir = ?, jurusan = ?
        WHERE nim = ?`,
      [values.nama, values.alamat, values.tgl_lahir, values.jurusan, nim]
    );
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, 'Mahasiswa tidak ditemukan.');
    }
    return sendResponse(res, 200, 'Data mahasiswa berhasil diperbarui.', {
      ...values,
      nim,
    });
  } catch (error) {
    console.error('[updateMahasiswa]', error);
    return sendResponse(res, 500, 'Terjadi kesalahan pada server.');
  }
};

// DELETE /api/mahasiswa/:nim
exports.deleteMahasiswa = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM mahasiswa WHERE nim = ?', [
      req.params.nim,
    ]);
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, 'Mahasiswa tidak ditemukan.');
    }
    return sendResponse(res, 200, 'Data mahasiswa berhasil dihapus.');
  } catch (error) {
    console.error('[deleteMahasiswa]', error);
    return sendResponse(res, 500, 'Terjadi kesalahan pada server.');
  }
};