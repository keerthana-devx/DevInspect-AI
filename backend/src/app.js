import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import testRoutes from './routes/testRoutes.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/test', testRoutes);


export default app;