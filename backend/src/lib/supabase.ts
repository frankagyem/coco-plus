import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { Database } from '../types/database';

let anonClient: SupabaseClient<Database> | null = null;
let adminClient: SupabaseClient<Database> | null = null;

export const supabase = (): SupabaseClient<Database> => {
    if (!anonClient) {
        anonClient = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return anonClient;
};

export const supabaseAdmin = (): SupabaseClient<Database> => {
    if (!adminClient) {
        adminClient = createClient<Database>(env.supabase.url, env.supabase.serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return adminClient;
};
