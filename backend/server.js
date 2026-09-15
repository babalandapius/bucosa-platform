import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & Rate Limiters
import { initSocket } from './config/socket.js';
import { authLimiter, publicFormLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routes
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import executiveRoutes from './routes/executiveRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import pastPaperRoutes from './routes/pastPaperRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// 1. Core Middlewares
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Rate Limiters (MUST be placed before the routes they protect)
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/contact', publicFormLimiter);

// 4. Feature Routes
app.use('/', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/executives', executiveRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/past-papers', pastPaperRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/news', newsRoutes);

// 5. Error Handling (MUST be at the absolute bottom)
app.use(notFound);      // Catches requests that didn't match any route above
app.use(errorHandler);  // Catches errors thrown by controllers

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.io active`);
});