import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { asyncHandler, HttpError } from './error';

export interface AuthUser {
    id: string;
    email: string;
}

const extractToken = (req: Request): string | null => {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        return header.slice(7).trim();
    }
    return null;
};

const resolveUser = async (req: Request): Promise<AuthUser | null> => {
    const token = extractToken(req);
    if (!token) {
        return null;
    }

    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data.user) {
        return null;
    }

    return {
        id: data.user.id,
        email: data.user.email ?? '',
    };
};

export const requireAuth = asyncHandler(async (req, res, next) => {
    const user = await resolveUser(req);
    if (!user) {
        throw HttpError.unauthorized();
    }
    res.locals.user = user;
    next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
    const user = await resolveUser(req);
    if (user) {
        res.locals.user = user;
    }
    next();
});

export const requireAdmin = asyncHandler(async (req, res, next) => {
    const user = (res.locals.user as AuthUser | undefined) ?? (await resolveUser(req));
    if (!user) {
        throw HttpError.unauthorized();
    }

    const { data, error } = await supabaseAdmin()
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    if (error) {
        throw new HttpError(500, 'Failed to verify permissions');
    }
    if (!data) {
        throw HttpError.forbidden();
    }

    res.locals.user = user;
    next();
});

export const getUser = (res: Response): AuthUser | undefined => res.locals.user as AuthUser | undefined;
