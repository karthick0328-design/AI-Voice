import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { connectDatabase } from './config/db.js';
import apiRoutes from './routes/api.js';
import { automationEngine } from './services/automation/AutomationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assets
app.use('/uploads', express.static(path.resolve('uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
async function bootstrap() {
  await connectDatabase();
  await automationEngine.init();

  const server = app.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`  AETHER AI OS BACKEND RUNNING ON PORT ${config.port}`);
    console.log(`  Ollama Target: ${config.ollama.baseUrl}`);
    console.log(`  MongoDB: ${config.mongoUri}`);
    console.log(`=================================================`);
  });

  const gracefulShutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

bootstrap().catch(err => {
  console.error('Fatal bootstrap error:', err);
});
