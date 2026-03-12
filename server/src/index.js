require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { passport } = require('./config/passport');
const { sessionMiddleware } = require('./middleware/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logsRouter = require('./routes/logs');
const authRouter = require('./routes/auth.routes');
const usersRouter = require('./routes/users.routes');
const moderationRouter = require('./routes/moderation.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Anonymous session token middleware (Sprint 1 — unchanged)
app.use(sessionMiddleware);

const PgSession = require('connect-pg-simple')(session);

app.use(
    session({
        store: new PgSession({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
);
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/api/logs', logsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api', moderationRouter);

if (process.env.NODE_ENV !== 'production') {
    const devRouter = require('./routes/dev');
    app.use('/api/dev', devRouter);
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

module.exports = app;
