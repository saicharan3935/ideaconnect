import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32
) {
  throw new Error(
    'Startup blocked: set JWT_SECRET to a random secret of at least 32 characters in server/.env.'
  );
}

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO Setup for real-time features
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'IdeaConnect API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/meta', metaRoutes);

// Global Error Handler
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Real-time connections ready for messaging and notifications
  socket.on('join_user_room', (userId: string) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

server.listen(PORT, () => {
  console.log(`🚀 IdeaConnect Server listening on port ${PORT}`);
  console.log(`⚡ API endpoint: http://localhost:${PORT}/api`);
});

export { app, io };
