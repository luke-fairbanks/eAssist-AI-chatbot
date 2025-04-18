import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import flowRoutes from './routes/flowRoutes';
import chatLogRoutes from './routes/chatLogRoutes';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Simple CORS configuration that will work with your frontend
app.use(cors({
  origin: true, // This allows all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Other middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', flowRoutes);
app.use('/api/logs', chatLogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  // Enhanced health check with more diagnostic info
  res.status(200).json({
    status: 'ok',
    message: 'Server running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    corsEnabled: true
  });
});

// Default route handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);

  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Create a more detailed error response
  const errorResponse = {
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  res.status(500).json(errorResponse);
});

// Start server
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for all origins`);
});

export default app;