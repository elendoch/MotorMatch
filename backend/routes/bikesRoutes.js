const express = require('express');
const router = express.Router();
const { getBikes, getBikeById, getGallery } = require('../controllers/bikesController');

router.get('/', getBikes);
router.get('/gallery', getGallery);
router.get('/:id', getBikeById);

module.exports = router;
