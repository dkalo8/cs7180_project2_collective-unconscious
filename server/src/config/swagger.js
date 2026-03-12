const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collective Unconscious API',
      version: '1.0.0',
      description: 'API documentation for the Collective Unconscious collaborative writing platform.',
    },
    servers: [
      {
        url: 'https://cs7180-project2-collective-unconscious-1.onrender.com/api',
        description: 'Production (via Proxy)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sessionToken',
          description: 'UUIDv4 session token used for identifying writers in a log.'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT for authenticated users (admins/registed users).'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
