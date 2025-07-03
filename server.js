import express from 'express';
import { handler } from './build/handler.js';

const app = express();

app.set('trust proxy', true);

app.use(handler);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ SvelteKit app listening at http://${HOST}:${PORT}`);
});
