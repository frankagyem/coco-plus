import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export const supabase = (): SupabaseClient => {
    if (!anonClient) {
        anonClient = createClient(env.supabase.url, env.supabase.anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return anonClient;
};

export const supabaseAdmin = (): SupabaseClient => {
    if (!adminClient) {
        adminClient = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return adminClient;
};
