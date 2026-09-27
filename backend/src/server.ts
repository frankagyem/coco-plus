import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { supabase } from './lib/supabase';
import { errorHandler, notFoundHandler } from './middleware/error';
import { catalogRouter } from './routes/catalog';
import { categoriesRouter } from './routes/categories';
import { ordersRouter } from './routes/orders';
import { productsRouter } from './routes/products';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: env.frontendUrl,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
    const { error } = await supabase().from('settings').select('id').limit(1);

    if (error) {
        res.status(503).json({ status: 'error', message: error.message });
        return;
    }

    res.json({ status: 'ok', message: 'COCO+ API is running', database: 'connected' });
});

app.use('/api', catalogRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = env.port;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
