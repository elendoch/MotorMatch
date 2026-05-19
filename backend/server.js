const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ----- swagger imports -----
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/authRoutes');
const bikesRoutes = require('./routes/bikesRoutes');
const profileRoutes = require('./routes/profileRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;


// ----- SWAGGER -----
const swaggerOptions = {
  definition: {
  openapi: '3.0.0',
  info: {
    title: 'MotorMatch API',
    version: '1.0.0',
    description: 'REST API for motorcycle comparison and user management',
  },

  servers: [
    {
      url:
        process.env.NODE_ENV === 'production'
          ? 'https://motormatch-z5nc.onrender.com'
          : 'http://localhost:5000',
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
},
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


// ----- CORS -----
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin → ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ----- routes -----
app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', perfilRoutes);
app.use('/api/favorites', favoritesRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MotorMatch API is running successfully.' });
});


// ----- this is where the magic starts -----
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${PORT} port`);
});
