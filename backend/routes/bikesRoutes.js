const express = require('express');
const router = express.Router();

const {
  getBikes,
  getBikeById,
  getGallery
} = require('../controllers/bikesController');


/**
 * @swagger
 * /api/bikes:
 *   get:
 *     summary: retrieve all bikes
 *     tags: [Bikes]
 *     responses:
 *       200:
 *         description: bike list retrieved successfully
 *       500:
 *         description: internal server error
 */
router.get('/', getBikes);


/**
 * @swagger
 * /api/bikes/gallery:
 *   get:
 *     summary: get related bikes gallery
 *     description: returns up to 3 related bikes based on brand.
 *     tags: [Bikes]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         example: 1
 *         required: true
 *         description: current bike ID
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         example: Yamaha
 *         required: true
 *         description: bike brand
 *     responses:
 *       200:
 *         description: related bikes retrieved successfully
 *       500:
 *         description: internal server error
 */
router.get('/gallery', getGallery);


/**
 * @swagger
 * /api/bikes/{id}:
 *   get:
 *     summary: get a bike by ID
 *     tags: [Bikes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: bike ID
 *     responses:
 *       200:
 *         description: bike found successfully
 *       404:
 *         description: bike not found
 *       500:
 *         description: internal server error
 */
router.get('/:id', getBikeById);


module.exports = router;