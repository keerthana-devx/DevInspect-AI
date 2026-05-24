import 'dotenv/config';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import { setupCollaboration } from './services/collaborationService.js';

console.log('🔍 Environment Check:');
console.log(`   PORT:               ${process.env.PORT || '5000'}`);
console.log(`   NODE_ENV:           ${process.env.NODE_ENV || 'not set'}`);
console.log(`   MONGO_URI:          ${process.env.MONGO_URI ? 'configured' : 'NOT CONFIGURED'}`);
console.log(`   JWT_SECRET:         ${process.env.JWT_SECRET ? 'configured' : 'NOT CONFIGURED'}`);
console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'configured' : 'not set — fallback mode'}`);
console.log(`   GOOGLE_CLIENT_ID:   ${process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not set — Google OAuth disabled'}`);
console.log(`   GITHUB_CLIENT_ID:   ${process.env.GITHUB_CLIENT_ID ? 'configured' : 'not set — GitHub OAuth disabled'}`);
console.log(`   EMAIL_USER:         ${process.env.EMAIL_USER ? 'configured' : 'not set — emails disabled'}`);

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
};

process.on('SIGTERM', async () => { await mongoose.connection.close(); process.exit(0); });
process.on('SIGINT',  async () => { await mongoose.connection.close(); process.exit(0); });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }

  // Create HTTP server + attach Socket.io
  const server = http.createServer(app);

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');
  const io = new SocketIO(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  });

  setupCollaboration(io);

  server.listen(PORT, () => {
    console.log(`🚀 DevInspectAI API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI: ${process.env.OPENROUTER_API_KEY ? 'OpenRouter ready' : 'Fallback mode'}`);
    console.log(`🔌 Socket.io: collaboration namespace /collab active`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} already in use`);
    } else {
      console.error(`❌ Server error:`, error);
    }
    process.exit(1);
  });
};

startServer();
