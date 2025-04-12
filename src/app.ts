import express from 'express';
import apiRoutes from './routes/apiRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authMiddleware from './authentification/authMiddleware';

export const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(authMiddleware);
app.use('/api/v1', apiRoutes);