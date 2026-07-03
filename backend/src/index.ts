import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './db/database';
import { apiRouter } from './routes/api';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'catdex-api' });
});

app.listen(PORT, () => {
  console.log(`CatDex API running on http://localhost:${PORT}`);
});
