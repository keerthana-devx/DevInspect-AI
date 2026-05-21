import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import adminRoutes from "./routes/adminRoutes.js";
app.use("/api/admin", adminRoutes);

/* ================================
   DEBUG ENV
================================ */

console.log("ENV PATH WORKING");
console.log("Current Folder:", process.cwd());

console.log('🔍 Environment Check:');
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? 'configured' : 'NOT CONFIGURED'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'configured' : 'NOT CONFIGURED'}`);
console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'configured' : 'not set'}`);
console.log(`   OPENROUTER_MODEL: ${process.env.OPENROUTER_MODEL || 'not set'}`);

/* ================================
   CONNECT DATABASE
================================ */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

/* ================================
   SHUTDOWN HANDLING
================================ */

process.on('SIGTERM', async () => {
  console.log('SIGTERM received');

  await mongoose.connection.close();

  console.log('MongoDB connection closed');

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received');

  await mongoose.connection.close();

  console.log('MongoDB connection closed');

  process.exit(0);
});

/* ================================
   START SERVER
================================ */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 DevInspectAI API running on port ${PORT}`);

    console.log(`📍 Environment: ${process.env.NODE_ENV}`);

    console.log(`🔗 Health: http://localhost:${PORT}/api/health`);

    console.log(
      `🤖 AI Service: ${
        process.env.OPENROUTER_API_KEY
          ? 'OpenRouter ready'
          : 'No AI key configured - using fallback mode'
      }`
    );
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