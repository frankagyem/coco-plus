import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
    const value = process.env[key];
    if (!value || value.startsWith('your-')) {
        throw new Error(
            `Missing required environment variable: ${key}. Copy .env.example to .env and fill it in.`
        );
    }
    return value;
};

const optional = (key: string, fallback: string): string => process.env[key] || fallback;

export const env = {
    port: Number(optional('PORT', '5000')),
    frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
    supabase: {
        url: required('SUPABASE_URL'),
        anonKey: required('SUPABASE_ANON_KEY'),
        serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    },
    jwt: {
        secret: required('JWT_SECRET'),
        expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    },
};

export type Env = typeof env;
