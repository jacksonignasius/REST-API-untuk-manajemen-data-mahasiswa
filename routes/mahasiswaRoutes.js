const express = require('express');
const controller = require('../controllers/mahasiswaController');

const router = express.Router();

router.get('/', controller.getAllMahasiswa);
router.get('/:nim', controller.getMahasiswaByNim);
router.post('/', controller.createMahasiswa);
router.put('/:nim', controller.updateMahasiswa);
router.delete('/:nim', controller.deleteMahasiswa);

module.exports = router;