import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { asyncHandler, HttpError } from '../middleware/error';

export const catalogRouter = Router();

catalogRouter.get(
    '/delivery-areas',
    asyncHandler(async (req, res) => {
        const { data, error } = await supabase()
            .from('delivery_areas')
            .select('id, name, fee, is_free')
            .order('name');

        if (error) {
            throw new HttpError(500, 'Failed to load delivery areas');
        }

        res.json({ data: data ?? [] });
    })
);

catalogRouter.get(
    '/settings',
    asyncHandler(async (req, res) => {
        const { data, error } = await supabase()
            .from('settings')
            .select('brand_name, tagline, whatsapp, email, location, currency, default_theme')
            .maybeSingle();

        if (error) {
            throw new HttpError(500, 'Failed to load settings');
        }

        res.json({ data });
    })
);
