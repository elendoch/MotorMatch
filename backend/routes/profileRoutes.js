const express = require('express');
const router = express.Router();

const {
  saveProfile,
  getProfile
} = require('../controllers/profileController');


/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: user profile management
 */


/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: create or update user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: profile saved successfully
 */
router.post('/', saveProfile);


/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: get user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: profile retrieved successfully
 */
router.get('/', getProfile);


module.exports = router;