const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');



/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: register a new user
 *     description: creates a new account and returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - contrasena
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: John Doe
 *               correo:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               contrasena:
 *                 type: string
 *                 example: mySecurePassword123
 *     responses:
 *       201:
 *         description: user registered successfully
 *       400:
 *         description: missing required fields
 *       409:
 *         description: email already registered
 *       500:
 *         description: internal server error
 */
router.post('/register', register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: authenticate user
 *     description: authenticates a user and returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               contrasena:
 *                 type: string
 *                 example: mySecurePassword123
 *               recordarme:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: login successful
 *       401:
 *         description: incorrect password
 *       403:
 *         description: account temporarily blocked
 *       404:
 *         description: user not found
 *       500:
 *         description: internal server error
 */
router.post('/login', login);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: send password recovery email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 example: johndoe@gmail.com
 *     responses:
 *       200:
 *         description: recovery instructions sent if email exists
 *       500:
 *         description: internal server error
 */
router.post('/forgot-password', forgotPassword);


/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: reset password using recovery token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - contrasena
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGc...
 *               contrasena:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: password reset successfully
 *       400:
 *         description: invalid or expired token
 *       500:
 *         description: internal server error
 */
router.post('/reset-password', resetPassword);


module.exports = router;