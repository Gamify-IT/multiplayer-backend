import express from 'express';
import apiRoutes from './routes/apiRoutes';
import cors from 'cors';

export const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/v1', apiRoutes);