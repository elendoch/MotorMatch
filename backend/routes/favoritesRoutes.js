const express = require('express');
const router = express.Router();

const {
  getFavoriteIds,
  addFavorite,
  removeFavorite
} = require('../controllers/favoritesController');

const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: retrieve authenticated user's favorite bikes
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: favorite bikes retrieved successfully
 *       401:
 *         description: missing authentication token
 *       403:
 *         description: invalid or expired token
 *       500:
 *         description: internal server error
 */
router.get('/', verifyToken, getFavoriteIds);


/**
 * @swagger
 * /api/favorites/{bikeId}:
 *   post:
 *     summary: add bike to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *         description: bike ID
 *     responses:
 *       201:
 *         description: bike added to favorites
 *       400:
 *         description: invalid motorcycle ID
 *       404:
 *         description: bike not found
 *       401:
 *         description: unauthorized
 *       500:
 *         description: internal server error
 */
router.post('/:bikeId', verifyToken, addFavorite);


/**
 * @swagger
 * /api/favorites/{bikeId}:
 *   delete:
 *     summary: remove bike from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *         description: bike ID
 *     responses:
 *       200:
 *         description: bike removed from favorites
 *       400:
 *         description: invalid motorcycle ID
 *       401:
 *         description: unauthorized
 *       500:
 *         description: internal server error
 */
router.delete('/:bikeId', verifyToken, removeFavorite);


module.exports = router;