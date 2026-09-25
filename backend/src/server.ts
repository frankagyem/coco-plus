import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { supabase } from './lib/supabase';

const app = express();

app.use(cors({
    origin: env.frontendUrl,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
    const { error } = await supabase().from('settings').select('id').limit(1);

    if (error) {
        res.status(503).json({ status: 'error', message: error.message });
        return;
    }

    res.json({ status: 'ok', message: 'COCO+ API is running', database: 'connected' });
});

const PORT = env.port;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
