import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import questionRoutes from './routes/questionRoutes';
import practiceRoutes from './routes/practiceRoutes';
import flashcardRoutes from './routes/flashcardRoutes';
import mockExamRoutes from './routes/mockExamRoutes';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== CORS CONFIG =====
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-domain.com']
  : ['http://192.168.78.67:3000', 'http://192.168.78.67:8081'];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman, curl, etc.

    const normalizedOrigin = origin.trim().replace(/\/$/, '').toLowerCase();

    if (allowedOrigins.some(o => o.toLowerCase() === normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'], // add more if needed
};

// Apply CORS
app.use(cors(corsOptions));

// Optional: preflight handling
//app.options(/.*/, cors(corsOptions));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/mock-exams', mockExamRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});


export default app;
