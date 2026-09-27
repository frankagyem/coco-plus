import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { asyncHandler, HttpError } from '../middleware/error';

export const categoriesRouter = Router();

categoriesRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const { data, error } = await supabase()
            .from('categories')
            .select('id, name, slug, type, image_url, products(count)')
            .order('name');

        if (error) {
            throw new HttpError(500, 'Failed to load categories');
        }

        res.json({ data });
    })
);
